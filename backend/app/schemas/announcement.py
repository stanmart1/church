from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime
from uuid import UUID

class AnnouncementCreate(BaseModel):
    title: str
    content: str
    priority: str = "medium"
    publish_date: date
    expiry_date: Optional[date] = None
    status: str = "draft"
    send_email: bool = False
    send_sms: bool = False

class AnnouncementUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    priority: Optional[str] = None
    publish_date: Optional[date] = None
    expiry_date: Optional[date] = None
    status: Optional[str] = None

class AnnouncementResponse(BaseModel):
    id: UUID
    title: str
    content: str
    priority: str
    publish_date: date
    expiry_date: Optional[date]
    status: str
    created_by: Optional[UUID]
    created_at: datetime
    
    class Config:
        from_attributes = True
