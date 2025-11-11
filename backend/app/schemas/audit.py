from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import UUID

class AuditLogCreate(BaseModel):
    event: str
    user_email: Optional[str] = None
    user_id: Optional[UUID] = None
    ip_address: Optional[str] = None
    device: Optional[str] = None
    severity: Optional[str] = None
    details: Optional[str] = None

class AuditLogResponse(BaseModel):
    id: UUID
    event: str
    user_email: Optional[str]
    user_id: Optional[UUID]
    ip_address: Optional[str]
    device: Optional[str]
    severity: Optional[str]
    details: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True
