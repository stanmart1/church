from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import UUID

class NotificationCreate(BaseModel):
    type: str
    message: str
    recipient_id: Optional[UUID] = None
    recipient_email: Optional[str] = None
    link: Optional[str] = None

class NotificationResponse(BaseModel):
    id: UUID
    type: str
    message: str
    status: str
    recipient_email: Optional[str]
    recipient_id: Optional[UUID]
    read: bool
    link: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True
