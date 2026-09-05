from sqlmodel import Session, select
from database.models import Document, DocumentVersion, ApprovalStatus, AuditLog
from typing import List, Dict, Any

def calculate_recency_score(versions: List[DocumentVersion]) -> Dict[int, int]:
    # Sort versions by date descending
    sorted_versions = sorted(versions, key=lambda v: v.updated_at, reverse=True)
    scores = {}
    for i, v in enumerate(sorted_versions):
        if i == 0:
            scores[v.id] = 25
        elif i == 1:
            scores[v.id] = 15
        else:
            scores[v.id] = 5
    return scores

def resolve_authoritative_version(query: str, user_role: str, session: Session) -> Dict[str, Any]:
    # 1. Search document content/title (Simple keyword match for prototype)
    search_query = f"%{query}%"
    docs = session.exec(select(Document).where(Document.title.ilike(search_query))).all()
    
    if not docs:
        # Fallback to search in versions
        versions = session.exec(select(DocumentVersion).where(DocumentVersion.content.ilike(search_query))).all()
        doc_ids = list(set([v.document_id for v in versions]))
        docs = session.exec(select(Document).where(Document.id.in_(doc_ids))).all()

    if not docs:
        return {"error": "No matching documents found."}

    # For simplicity, we just evaluate the first matching document
    doc = docs[0]
    
    # 2. Get all versions for this document
    all_versions = session.exec(select(DocumentVersion).where(DocumentVersion.document_id == doc.id)).all()
    
    # 3. Apply access control filtering & remove archived
    accessible_versions = []
    for v in all_versions:
        allowed = v.allowed_roles.split(",") if v.allowed_roles else []
        if (user_role in allowed or "Administrator" in allowed) and not v.is_archived:
            accessible_versions.append(v)
            
    if not accessible_versions:
        # Log unauthorized access attempt if all versions were blocked
        log = AuditLog(user=user_role, action="ACCESS_DENIED", document_id=doc.id, result="FAIL", reason="Unauthorized retrieval attempt")
        session.add(log)
        session.commit()
        return {"error": "Unauthorized to access this document.", "status_code": 403}

    # 4. Calculate Scores
    recency_scores = calculate_recency_score(accessible_versions)
    
    scored_versions = []
    for v in accessible_versions:
        # Approval Score
        approval_score = 0
        if v.approval_status == ApprovalStatus.APPROVED:
            approval_score = 50
        elif v.approval_status == ApprovalStatus.PENDING:
            approval_score = 20
        elif v.approval_status == ApprovalStatus.DRAFT:
            approval_score = 10
            
        # Ownership Score (Simple mock: if owner is known, give 25)
        # In reality, this would check if v.owner matches doc's original designated department/owner
        ownership_score = 25 if v.owner else 0
        
        # Recency Score
        recency_score = recency_scores.get(v.id, 0)
        
        total_score = approval_score + ownership_score + recency_score
        
        scored_versions.append({
            "version": v,
            "scores": {
                "approval_score": approval_score,
                "ownership_score": ownership_score,
                "recency_score": recency_score,
                "total_score": total_score
            }
        })
        
    # 5. Rank
    scored_versions.sort(key=lambda x: x["scores"]["total_score"], reverse=True)
    
    top_result = scored_versions[0]
    
    # Check for conflict (two approved versions)
    approved_versions = [v for v in accessible_versions if v.approval_status == ApprovalStatus.APPROVED]
    has_conflict = len(approved_versions) > 1
    
    # Log the resolution
    log = AuditLog(user=user_role, action="RESOLVE", document_id=doc.id, version_id=top_result["version"].id, result="SUCCESS", reason=f"Score: {top_result['scores']['total_score']}")
    session.add(log)
    session.commit()
    
    return {
        "document": doc,
        "selected_version": top_result["version"],
        "scores": top_result["scores"],
        "has_conflict": has_conflict,
        "citation": {
            "source_file": top_result["version"].source_file,
            "page": top_result["version"].page_number,
            "section": top_result["version"].section
        },
        "all_ranked": [{"version_num": s["version"].version_num, "score": s["scores"]["total_score"]} for s in scored_versions]
    }
