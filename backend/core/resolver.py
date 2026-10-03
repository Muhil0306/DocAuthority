"""
Core Authority Resolver Algorithm Module.

This module implements the multi-factor deterministic ranking engine for DocAuthority.
It resolves candidate document versions based on approval workflow status, verified 
departmental ownership, recency chronology, and role-based security access control.
"""

from sqlmodel import Session, select
from database.models import Document, DocumentVersion, ApprovalStatus, AuditLog
from typing import List, Dict, Any

def calculate_recency_score(versions: List[DocumentVersion]) -> Dict[int, int]:
    """
    Calculates dynamic recency points (0 to 25 points) based on version update chronology.
    
    Scoring Breakdown:
    - Latest Version: 25 Points
    - Second Latest Version: 15 Points
    - Older Versions: 5 Points
    
    Args:
        versions (List[DocumentVersion]): List of accessible candidate document versions.
        
    Returns:
        Dict[int, int]: A mapping of version_id to recency score points.
    """
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
    """
    Executes the 5-Stage Authority Resolution Pipeline for a given search query and user role.
    
    Pipeline Stages:
    1. Query Content & Title Matching: Searches document titles and version contents.
    2. RBAC Security Pruning: Filters out archived and unauthorized document versions.
    3. Multi-Factor Authority Scoring:
       - Approval Score (Max 50): APPROVED=50, PENDING=20, DRAFT=10, REJECTED/ARCHIVED=0.
       - Ownership Score (Max 25): Verified departmental owner bonus.
       - Recency Score (Max 25): Version update chronology.
    4. Deterministic Ranking & Conflict Detection: Ranks candidates; flags multiple APPROVED versions.
    5. Audit Trail & Citation Generation: Logs resolution to AuditLog and generates traceable citation.
    
    Args:
        query (str): The search term or policy question.
        user_role (str): Active user role (Consultant, Manager, HR, Finance, Administrator).
        session (Session): Database session instance.
        
    Returns:
        Dict[str, Any]: Resolution payload containing selected version, scores, citation, and metadata.
    """
    # STAGE 1: Search Document Titles and Content
    search_query = f"%{query}%"
    docs = session.exec(select(Document).where(Document.title.ilike(search_query))).all()
    
    if not docs:
        versions = session.exec(select(DocumentVersion).where(DocumentVersion.content.ilike(search_query))).all()
        doc_ids = list(set([v.document_id for v in versions]))
        docs = session.exec(select(Document).where(Document.id.in_(doc_ids))).all()

    if not docs:
        return {"error": "No matching documents found.", "status_code": 404}

    doc = docs[0]
    all_versions = session.exec(select(DocumentVersion).where(DocumentVersion.document_id == doc.id)).all()
    
    # STAGE 2: Role-Based Access Control (RBAC) & Active Status Filtering
    accessible_versions = []
    for v in all_versions:
        allowed = [r.strip() for r in v.allowed_roles.split(",")] if v.allowed_roles else []
        # Correct RBAC logic: User is allowed if their role is explicitly listed, OR if the active user IS Administrator
        if (user_role in allowed or user_role == "Administrator") and not v.is_archived:
            accessible_versions.append(v)
            
    if not accessible_versions:
        # Audit Log Event: Log unauthorized access attempt when security check fails
        log = AuditLog(
            user=user_role, 
            action="ACCESS_DENIED", 
            document_id=doc.id, 
            result="FAIL", 
            reason=f"Role '{user_role}' unauthorized to access document '{doc.title}'"
        )
        session.add(log)
        session.commit()
        return {"error": "Unauthorized to access this document.", "status_code": 403}

    # STAGE 3: Multi-Factor Authority Scoring Engine
    recency_scores = calculate_recency_score(accessible_versions)
    
    scored_versions = []
    for v in accessible_versions:
        approval_score = 0
        if v.approval_status == ApprovalStatus.APPROVED:
            approval_score = 50
        elif v.approval_status == ApprovalStatus.PENDING:
            approval_score = 20
        elif v.approval_status == ApprovalStatus.DRAFT:
            approval_score = 10
            
        ownership_score = 25 if v.owner else 0
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
        
    # STAGE 4: Candidate Ranking & Conflict Analysis
    scored_versions.sort(key=lambda x: x["scores"]["total_score"], reverse=True)
    top_result = scored_versions[0]
    
    approved_versions = [v for v in accessible_versions if v.approval_status == ApprovalStatus.APPROVED]
    has_conflict = len(approved_versions) > 1
    
    # STAGE 5: Audit Trail Logging & Response Payload
    log = AuditLog(
        user=user_role, 
        action="RESOLVE", 
        document_id=doc.id, 
        version_id=top_result["version"].id, 
        result="SUCCESS", 
        reason=f"Selected v{top_result['version'].version_num} with score {top_result['scores']['total_score']}"
    )
    session.add(log)
    session.commit()
    
    return {
        "document": doc,
        "selected_version": top_result["version"],
        "scores": top_result["scores"],
        "has_conflict": has_conflict,
        "citation": {
            "source_file": top_result["version"].source_file,
            "source_type": getattr(top_result["version"], "source_type", getattr(doc, "source_type", "PDF Document")),
            "page": top_result["version"].page_number,
            "section": top_result["version"].section
        },
        "all_ranked": [
            {"version_num": s["version"].version_num, "score": s["scores"]["total_score"]} 
            for s in scored_versions
        ]
    }
