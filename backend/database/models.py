from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
from datetime import datetime
from enum import Enum

class ApprovalStatus(str, Enum):
    APPROVED = "APPROVED"
    PENDING = "PENDING"
    DRAFT = "DRAFT"
    REJECTED = "REJECTED"
    ARCHIVED = "ARCHIVED"

class AccessRole(str, Enum):
    CONSULTANT = "Consultant"
    MANAGER = "Manager"
    HR = "HR"
    FINANCE = "Finance"
    ADMINISTRATOR = "Administrator"

class Document(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str = Field(index=True)
    department: str
    owner_id: int
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    versions: List["DocumentVersion"] = Relationship(back_populates="document")

class DocumentVersion(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    document_id: int = Field(foreign_key="document.id")
    version_num: int
    content: str
    owner: str
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    approval_status: ApprovalStatus = Field(default=ApprovalStatus.DRAFT)
    approved_by: Optional[str] = None
    approved_at: Optional[datetime] = None
    allowed_roles: str # Comma separated list of roles
    source_file: str
    page_number: int
    section: str
    is_archived: bool = Field(default=False)
    previous_version_id: Optional[int] = None

    document: Document = Relationship(back_populates="versions")
    approvals: List["Approval"] = Relationship(back_populates="document_version")

class Approval(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    document_version_id: int = Field(foreign_key="documentversion.id")
    submitted_by: str
    approved_by: Optional[str] = None
    status: ApprovalStatus
    date: datetime = Field(default_factory=datetime.utcnow)
    comments: Optional[str] = None
    
    document_version: DocumentVersion = Relationship(back_populates="approvals")

class AuditLog(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user: str
    action: str
    document_id: Optional[int] = None
    version_id: Optional[int] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    result: str
    reason: Optional[str] = None

class Citation(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    document_version_id: int = Field(foreign_key="documentversion.id")
    query: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class RollbackHistory(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    document_id: int = Field(foreign_key="document.id")
    from_version_id: int
    to_version_id: int
    rolled_back_by: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
