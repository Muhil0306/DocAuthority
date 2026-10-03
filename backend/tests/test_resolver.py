"""
Unit tests for DocAuthority core resolver algorithm and scoring engine.
Runs via pytest.
"""

import pytest
from datetime import datetime, timedelta
from sqlmodel import Session, SQLModel, create_engine
from database.models import Document, DocumentVersion, ApprovalStatus, AccessRole, AuditLog
from core.resolver import resolve_authoritative_version, calculate_recency_score

# Setup an in-memory SQLite database for isolated unit testing
@pytest.fixture(name="session")
def session_fixture():
    engine = create_engine("sqlite:///:memory:", echo=False)
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        yield session

def test_older_approved_beats_newer_draft(session: Session):
    """
    Unit Test 1: Verifies that an older APPROVED version outranks a newer DRAFT version.
    """
    doc = Document(title="Pricing Policy", department="Finance", owner_id=1)
    session.add(doc)
    session.commit()

    # Older Approved Version (10 days ago) -> 50 (Approval) + 25 (Owner) + 15 (Recency) = 90
    v1 = DocumentVersion(
        document_id=doc.id,
        version_num=1,
        content="Pricing Policy v1 approved text.",
        owner="Alice Smith",
        updated_at=datetime.utcnow() - timedelta(days=10),
        approval_status=ApprovalStatus.APPROVED,
        allowed_roles="Consultant,Manager,Finance,Administrator",
        source_file="Pricing_v1.pdf",
        page_number=1,
        section="1.0"
    )
    # Newer Draft Version (1 day ago) -> 10 (Draft) + 25 (Owner) + 25 (Recency) = 60
    v2 = DocumentVersion(
        document_id=doc.id,
        version_num=2,
        content="Pricing Policy v2 draft text.",
        owner="Alice Smith",
        updated_at=datetime.utcnow() - timedelta(days=1),
        approval_status=ApprovalStatus.DRAFT,
        allowed_roles="Consultant,Manager,Finance,Administrator",
        source_file="Pricing_v2_Draft.docx",
        page_number=1,
        section="1.0",
        previous_version_id=v1.id
    )
    session.add(v1)
    session.add(v2)
    session.commit()

    result = resolve_authoritative_version("Pricing Policy", "Consultant", session)
    
    assert "error" not in result
    assert result["selected_version"].id == v1.id
    assert result["selected_version"].version_num == 1
    assert result["scores"]["total_score"] == 90
    assert result["has_conflict"] is False

def test_rbac_unauthorized_access_denied(session: Session):
    """
    Unit Test 2: Verifies that RBAC blocks unauthorized users and logs an ACCESS_DENIED audit event.
    """
    doc = Document(title="Employee Disciplinary Procedure", department="HR", owner_id=2)
    session.add(doc)
    session.commit()

    v1 = DocumentVersion(
        document_id=doc.id,
        version_num=1,
        content="Confidential HR Disciplinary Procedure.",
        owner="Bob Jones",
        updated_at=datetime.utcnow() - timedelta(days=5),
        approval_status=ApprovalStatus.APPROVED,
        allowed_roles="HR,Administrator", # Consultant NOT allowed
        source_file="Disciplinary.pdf",
        page_number=1,
        section="1.0"
    )
    session.add(v1)
    session.commit()

    # Attempt access as Consultant (should fail)
    result = resolve_authoritative_version("Disciplinary", "Consultant", session)
    
    assert "error" in result
    assert result["status_code"] == 403

    # Check AuditLog entry created for access denied
    log = session.query(AuditLog).filter(AuditLog.action == "ACCESS_DENIED").first()
    assert log is not None
    assert log.user == "Consultant"
    assert log.result == "FAIL"

def test_conflicting_approved_versions_detection(session: Session):
    """
    Unit Test 3: Verifies conflict detection when multiple versions have APPROVED status.
    """
    doc = Document(title="Data Security Policy", department="Technology", owner_id=3)
    session.add(doc)
    session.commit()

    v1 = DocumentVersion(
        document_id=doc.id,
        version_num=1,
        content="Security v1",
        owner="Charlie",
        updated_at=datetime.utcnow() - timedelta(days=15),
        approval_status=ApprovalStatus.APPROVED,
        allowed_roles="Consultant,Administrator",
        source_file="Security_v1.pdf",
        page_number=1,
        section="1"
    )
    v2 = DocumentVersion(
        document_id=doc.id,
        version_num=2,
        content="Security v2",
        owner="Charlie",
        updated_at=datetime.utcnow() - timedelta(days=2),
        approval_status=ApprovalStatus.APPROVED,
        allowed_roles="Consultant,Administrator",
        source_file="Security_v2.pdf",
        page_number=1,
        section="1"
    )
    session.add(v1)
    session.add(v2)
    session.commit()

    result = resolve_authoritative_version("Data Security", "Consultant", session)
    
    assert result["has_conflict"] is True
    assert result["selected_version"].id == v2.id # Newer approved version wins tie
