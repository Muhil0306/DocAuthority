from sqlmodel import SQLModel, Session, create_engine, select
from database.models import Document, DocumentVersion, Approval, ApprovalStatus, AuditLog, AccessRole, SourceType
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
        departments = ["Finance", "HR", "Strategy", "Operations", "Technology", "Risk & Compliance"]
        owners = ["Alice Smith", "Bob Jones", "Charlie Davis", "Diana Prince", "Evan Wright"]
        roles = [r.value for r in AccessRole]
        source_types = [s.value for s in SourceType]
        
        # Scenario 1: Older approved beats newer draft (PDF)
        doc1 = Document(title="Pricing Policy", department="Finance", owner_id=1, source_type=SourceType.DOCUMENT_PDF.value)
        session.add(doc1)
        session.commit()
        
        v1_1 = DocumentVersion(document_id=doc1.id, version_num=1, content="Pricing policy v1 text.", owner="Alice Smith", updated_at=datetime.utcnow() - timedelta(days=10), approval_status=ApprovalStatus.APPROVED, approved_by="Manager X", allowed_roles="Consultant,Manager,Finance,Administrator", source_file="Pricing_Policy.pdf", source_type=SourceType.DOCUMENT_PDF.value, page_number=1, section="1.0")
        session.add(v1_1)
        session.commit()
        
        v1_2 = DocumentVersion(document_id=doc1.id, version_num=2, content="Pricing policy v2 draft text with new terms.", owner="Alice Smith", updated_at=datetime.utcnow() - timedelta(days=2), approval_status=ApprovalStatus.DRAFT, allowed_roles="Consultant,Manager,Finance,Administrator", source_file="Pricing_Policy_Draft.docx", source_type=SourceType.DOCUMENT_PDF.value, page_number=1, section="1.0", previous_version_id=v1_1.id)
        session.add(v1_2)
        
        # Scenario 2: Heterogeneous Chat Log (Slack/Teams)
        doc_chat = Document(title="Q3 Pricing Strategy Discussion Log", department="Finance", owner_id=1, source_type=SourceType.CHAT_RECORD.value)
        session.add(doc_chat)
        session.commit()
        
        v_chat_1 = DocumentVersion(document_id=doc_chat.id, version_num=1, content="[Slack #finance-pricing] Alice Smith: Confirmed with CFO that v1 rates remain authoritative until Q4.", owner="Alice Smith", updated_at=datetime.utcnow() - timedelta(days=5), approval_status=ApprovalStatus.APPROVED, approved_by="CFO", allowed_roles="Consultant,Manager,Finance,Administrator", source_file="Slack_channel_finance_pricing_log_2026.json", source_type=SourceType.CHAT_RECORD.value, page_number=1, section="Msg-104")
        session.add(v_chat_1)

        # Scenario 3: Heterogeneous Meeting Transcript (Teams/Zoom)
        doc_transcript = Document(title="Executive Committee Meeting Transcript - Policy Review", department="Strategy", owner_id=3, source_type=SourceType.MEETING_TRANSCRIPT.value)
        session.add(doc_transcript)
        session.commit()
        
        v_trans_1 = DocumentVersion(document_id=doc_transcript.id, version_num=1, content="[Teams Transcript 00:24:15] Charlie Davis: We officially approved the new travel allowance limits.", owner="Charlie Davis", updated_at=datetime.utcnow() - timedelta(days=7), approval_status=ApprovalStatus.APPROVED, approved_by="Exec Board", allowed_roles="Consultant,Manager,HR,Finance,Administrator", source_file="Teams_Exec_Meeting_2026_08_28.vtt", source_type=SourceType.MEETING_TRANSCRIPT.value, page_number=3, section="Speaker-Charlie-00:24:15")
        session.add(v_trans_1)

        # Scenario 4: Two approved versions (conflict warning)
        doc2 = Document(title="Data Security Policy", department="Technology", owner_id=3, source_type=SourceType.DOCUMENT_PDF.value)
        session.add(doc2)
        session.commit()
        
        v2_1 = DocumentVersion(document_id=doc2.id, version_num=1, content="Security policy v1.", owner="Charlie Davis", updated_at=datetime.utcnow() - timedelta(days=20), approval_status=ApprovalStatus.APPROVED, approved_by="CTO", allowed_roles="Consultant,Manager,HR,Finance,Administrator", source_file="Security_Policy_v1.pdf", source_type=SourceType.DOCUMENT_PDF.value, page_number=2, section="2.1")
        session.add(v2_1)
        session.commit()
        
        v2_2 = DocumentVersion(document_id=doc2.id, version_num=2, content="Security policy v2.", owner="Charlie Davis", updated_at=datetime.utcnow() - timedelta(days=5), approval_status=ApprovalStatus.APPROVED, approved_by="CTO", allowed_roles="Consultant,Manager,HR,Finance,Administrator", source_file="Security_Policy_v2.pdf", source_type=SourceType.DOCUMENT_PDF.value, page_number=1, section="1.0", previous_version_id=v2_1.id)
        session.add(v2_2)
        
        # Scenario 5: Access Control (Only HR and Admin can see)
        doc3 = Document(title="Employee Disciplinary Procedure", department="HR", owner_id=2, source_type=SourceType.DOCUMENT_PDF.value)
        session.add(doc3)
        session.commit()
        
        v3_1 = DocumentVersion(document_id=doc3.id, version_num=1, content="HR procedure for disciplinary action.", owner="Bob Jones", updated_at=datetime.utcnow() - timedelta(days=15), approval_status=ApprovalStatus.APPROVED, approved_by="HR Head", allowed_roles="HR,Administrator", source_file="HR_Manual.pdf", source_type=SourceType.DOCUMENT_PDF.value, page_number=45, section="5.2")
        session.add(v3_1)

        # Scenario 6: Standard document (Travel Policy)
        doc4 = Document(title="Travel Policy", department="Operations", owner_id=4, source_type=SourceType.DOCUMENT_PDF.value)
        session.add(doc4)
        session.commit()

        v4_1 = DocumentVersion(document_id=doc4.id, version_num=1, content="Standard travel allowances.", owner="Diana Prince", updated_at=datetime.utcnow() - timedelta(days=30), approval_status=ApprovalStatus.ARCHIVED, allowed_roles="Consultant,Manager,HR,Finance,Administrator", source_file="Travel_v1.pdf", source_type=SourceType.DOCUMENT_PDF.value, page_number=1, section="1", is_archived=True)
        session.add(v4_1)
        session.commit()

        v4_2 = DocumentVersion(document_id=doc4.id, version_num=2, content="Updated travel allowances 2026.", owner="Diana Prince", updated_at=datetime.utcnow() - timedelta(days=1), approval_status=ApprovalStatus.APPROVED, approved_by="CFO", allowed_roles="Consultant,Manager,HR,Finance,Administrator", source_file="Travel_v2.pdf", source_type=SourceType.DOCUMENT_PDF.value, page_number=1, section="1", previous_version_id=v4_1.id)
        session.add(v4_2)
        
        # Generate full benchmark dataset of ~100 additional items across all heterogeneous source types
        titles = [
            ("Client Engagement Guidelines", "HR", SourceType.DOCUMENT_PDF.value),
            ("Project Governance Framework", "Strategy", SourceType.DOCUMENT_PDF.value),
            ("Financial Approval Matrix", "Finance", SourceType.DOCUMENT_PDF.value),
            ("Risk Management Policy", "Risk & Compliance", SourceType.DOCUMENT_PDF.value),
            ("Client Onboarding Procedure", "Operations", SourceType.DOCUMENT_PDF.value),
            ("Weekly Operations Alignment Chat", "Operations", SourceType.CHAT_RECORD.value),
            ("Architecture Review Board Transcript", "Technology", SourceType.MEETING_TRANSCRIPT.value),
            ("Compliance Directive Email Broadcast", "Risk & Compliance", SourceType.EMAIL_RECORD.value),
            ("Vendor Security Checklist Chat", "Technology", SourceType.CHAT_RECORD.value),
            ("Townhall Leadership Q&A Transcript", "Strategy", SourceType.MEETING_TRANSCRIPT.value),
        ]
        
        for idx in range(10):
            base_title, dept, stype = titles[idx % len(titles)]
            for copy_num in range(10):
                t = f"{base_title} (Ref #{copy_num + 1})" if copy_num > 0 else base_title
                doc = Document(title=t, department=dept, owner_id=random.randint(1,5), source_type=stype)
                session.add(doc)
                session.commit()
                
                # Create 3 versions per document
                v1 = DocumentVersion(
                    document_id=doc.id, 
                    version_num=1, 
                    content=f"{t} initial authoritative record.", 
                    owner=random.choice(owners), 
                    updated_at=datetime.utcnow() - timedelta(days=random.randint(30, 90)), 
                    approval_status=ApprovalStatus.APPROVED, 
                    approved_by="Admin", 
                    allowed_roles="Consultant,Manager,HR,Finance,Administrator", 
                    source_file=f"{t.replace(' ', '_')}_v1.dat", 
                    source_type=stype,
                    page_number=random.randint(1, 10), 
                    section=f"Sec-{random.randint(1, 5)}"
                )
                session.add(v1)
                session.commit()
                
                v2 = DocumentVersion(
                    document_id=doc.id, 
                    version_num=2, 
                    content=f"{t} proposed draft update.", 
                    owner=random.choice(owners), 
                    updated_at=datetime.utcnow() - timedelta(days=random.randint(1, 15)), 
                    approval_status=ApprovalStatus.DRAFT, 
                    allowed_roles="Consultant,Manager,HR,Finance,Administrator", 
                    source_file=f"{t.replace(' ', '_')}_v2.dat", 
                    source_type=stype,
                    page_number=random.randint(1, 10), 
                    section=f"Sec-{random.randint(1, 5)}", 
                    previous_version_id=v1.id
                )
                session.add(v2)
                session.commit()

        session.commit()

if __name__ == "__main__":
    create_db_and_tables()
    seed_data()
    print("Database seeded successfully with heterogeneous input sources.")
