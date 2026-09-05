from sqlmodel import SQLModel, Session, create_engine, select
from database.models import Document, DocumentVersion, Approval, ApprovalStatus, AuditLog, AccessRole
from datetime import datetime, timedelta
import random

sqlite_file_name = "docauthority.db"
sqlite_url = f"sqlite:///{sqlite_file_name}"
engine = create_engine(sqlite_url, echo=False)

def create_db_and_tables():
    SQLModel.metadata.drop_all(engine)
    SQLModel.metadata.create_all(engine)

def seed_data():
    with Session(engine) as session:
        # Departments & Owners
        departments = ["Finance", "HR", "Strategy", "Operations", "Technology", "Risk & Compliance"]
        owners = ["Alice Smith", "Bob Jones", "Charlie Davis", "Diana Prince", "Evan Wright"]
        roles = [r.value for r in AccessRole]
        
        # Scenarios
        # Scenario 1: Older approved beats newer draft
        doc1 = Document(title="Pricing Policy", department="Finance", owner_id=1)
        session.add(doc1)
        session.commit()
        
        v1_1 = DocumentVersion(document_id=doc1.id, version_num=1, content="Pricing policy v1 text.", owner="Alice Smith", updated_at=datetime.utcnow() - timedelta(days=10), approval_status=ApprovalStatus.APPROVED, approved_by="Manager X", allowed_roles="Consultant,Manager,Finance,Administrator", source_file="Pricing_Policy.pdf", page_number=1, section="1.0")
        session.add(v1_1)
        session.commit()
        
        v1_2 = DocumentVersion(document_id=doc1.id, version_num=2, content="Pricing policy v2 draft text with new terms.", owner="Alice Smith", updated_at=datetime.utcnow() - timedelta(days=2), approval_status=ApprovalStatus.DRAFT, allowed_roles="Consultant,Manager,Finance,Administrator", source_file="Pricing_Policy_Draft.docx", page_number=1, section="1.0", previous_version_id=v1_1.id)
        session.add(v1_2)
        
        # Scenario 2: Two approved versions (conflict warning)
        doc2 = Document(title="Data Security Policy", department="Technology", owner_id=3)
        session.add(doc2)
        session.commit()
        
        v2_1 = DocumentVersion(document_id=doc2.id, version_num=1, content="Security policy v1.", owner="Charlie Davis", updated_at=datetime.utcnow() - timedelta(days=20), approval_status=ApprovalStatus.APPROVED, approved_by="CTO", allowed_roles="Consultant,Manager,HR,Finance,Administrator", source_file="Security_Policy_v1.pdf", page_number=2, section="2.1")
        session.add(v2_1)
        session.commit()
        
        v2_2 = DocumentVersion(document_id=doc2.id, version_num=2, content="Security policy v2.", owner="Charlie Davis", updated_at=datetime.utcnow() - timedelta(days=5), approval_status=ApprovalStatus.APPROVED, approved_by="CTO", allowed_roles="Consultant,Manager,HR,Finance,Administrator", source_file="Security_Policy_v2.pdf", page_number=1, section="1.0", previous_version_id=v2_1.id)
        session.add(v2_2)
        
        # Scenario 3: Access Control (Only HR and Admin can see)
        doc3 = Document(title="Employee Disciplinary Procedure", department="HR", owner_id=2)
        session.add(doc3)
        session.commit()
        
        v3_1 = DocumentVersion(document_id=doc3.id, version_num=1, content="HR procedure for disciplinary action.", owner="Bob Jones", updated_at=datetime.utcnow() - timedelta(days=15), approval_status=ApprovalStatus.APPROVED, approved_by="HR Head", allowed_roles="HR,Administrator", source_file="HR_Manual.pdf", page_number=45, section="5.2")
        session.add(v3_1)

        # Scenario 4: Standard document
        doc4 = Document(title="Travel Policy", department="Operations", owner_id=4)
        session.add(doc4)
        session.commit()

        v4_1 = DocumentVersion(document_id=doc4.id, version_num=1, content="Standard travel allowances.", owner="Diana Prince", updated_at=datetime.utcnow() - timedelta(days=30), approval_status=ApprovalStatus.ARCHIVED, allowed_roles="Consultant,Manager,HR,Finance,Administrator", source_file="Travel_v1.pdf", page_number=1, section="1", is_archived=True)
        session.add(v4_1)
        session.commit()

        v4_2 = DocumentVersion(document_id=doc4.id, version_num=2, content="Updated travel allowances 2026.", owner="Diana Prince", updated_at=datetime.utcnow() - timedelta(days=1), approval_status=ApprovalStatus.APPROVED, approved_by="CFO", allowed_roles="Consultant,Manager,HR,Finance,Administrator", source_file="Travel_v2.pdf", page_number=1, section="1", previous_version_id=v4_1.id)
        session.add(v4_2)
        
        # Add a bunch of random docs
        titles = ["Client Engagement Guidelines", "Project Governance Framework", "Financial Approval Matrix", "Risk Management Policy", "Client Onboarding Procedure"]
        for i, t in enumerate(titles):
            doc = Document(title=t, department=random.choice(departments), owner_id=random.randint(1,5))
            session.add(doc)
            session.commit()
            
            # v1
            v1 = DocumentVersion(document_id=doc.id, version_num=1, content=f"{t} base content.", owner=random.choice(owners), updated_at=datetime.utcnow() - timedelta(days=40), approval_status=ApprovalStatus.APPROVED, approved_by="Admin", allowed_roles="Consultant,Manager,HR,Finance,Administrator", source_file=f"{t.replace(' ', '_')}_v1.pdf", page_number=1, section="1")
            session.add(v1)
            session.commit()
            
            if i % 2 == 0:
                # Add draft v2
                v2 = DocumentVersion(document_id=doc.id, version_num=2, content=f"{t} updated draft content.", owner=random.choice(owners), updated_at=datetime.utcnow() - timedelta(days=3), approval_status=ApprovalStatus.DRAFT, allowed_roles="Consultant,Manager,HR,Finance,Administrator", source_file=f"{t.replace(' ', '_')}_v2.docx", page_number=1, section="1", previous_version_id=v1.id)
                session.add(v2)

        session.commit()

if __name__ == "__main__":
    create_db_and_tables()
    seed_data()
    print("Database seeded successfully.")
