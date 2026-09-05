from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select
from typing import List, Optional
from database.models import Document, DocumentVersion, Approval, AuditLog, ApprovalStatus
from database.seed import engine
from core.resolver import resolve_authoritative_version

router = APIRouter()

def get_session():
    with Session(engine) as session:
        yield session

@router.get("/documents", response_model=List[Document])
def get_documents(session: Session = Depends(get_session)):
    docs = session.exec(select(Document)).all()
    return docs

@router.get("/documents/{doc_id}", response_model=Document)
def get_document(doc_id: int, session: Session = Depends(get_session)):
    doc = session.get(Document, doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return doc

@router.get("/documents/{doc_id}/versions", response_model=List[DocumentVersion])
def get_document_versions(doc_id: int, session: Session = Depends(get_session)):
    versions = session.exec(select(DocumentVersion).where(DocumentVersion.document_id == doc_id)).all()
    return versions

@router.get("/search")
def search(q: str, role: str = Query(..., description="User role"), session: Session = Depends(get_session)):
    result = resolve_authoritative_version(q, role, session)
    if "error" in result:
        raise HTTPException(status_code=result.get("status_code", 404), detail=result["error"])
    return result

@router.post("/resolve")
def resolve(q: str, role: str, session: Session = Depends(get_session)):
    result = resolve_authoritative_version(q, role, session)
    return result

@router.get("/audit-logs", response_model=List[AuditLog])
def get_audit_logs(session: Session = Depends(get_session)):
    logs = session.exec(select(AuditLog).order_by(AuditLog.timestamp.desc())).all()
    return logs

@router.post("/rollback")
def rollback_version(doc_id: int, target_version_id: int, role: str, session: Session = Depends(get_session)):
    doc = session.get(Document, doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
        
    versions = session.exec(select(DocumentVersion).where(DocumentVersion.document_id == doc_id)).all()
    
    # Simple rollback logic: mark newer versions as archived, set target version to APPROVED
    target_version = None
    for v in versions:
        if v.id == target_version_id:
            target_version = v
            
    if not target_version:
        raise HTTPException(status_code=404, detail="Target version not found")
        
    for v in versions:
        if v.updated_at > target_version.updated_at:
            v.is_archived = True
            v.approval_status = ApprovalStatus.ARCHIVED
            session.add(v)
            
    target_version.is_archived = False
    target_version.approval_status = ApprovalStatus.APPROVED
    session.add(target_version)
    
    log = AuditLog(user=role, action="ROLLBACK", document_id=doc.id, version_id=target_version.id, result="SUCCESS", reason="User initiated rollback")
    session.add(log)
    session.commit()
    return {"message": "Rollback successful"}

@router.get("/evaluation")
def get_evaluation():
    # Mock data for demonstration as requested
    return {
        "metrics": {
            "baseline": {"accuracy": 45.2, "precision": 50.1, "recall": 60.5, "unauthorized_retrievals": 12},
            "proposed": {"accuracy": 94.8, "precision": 96.2, "recall": 93.4, "unauthorized_retrievals": 0}
        }
    }
