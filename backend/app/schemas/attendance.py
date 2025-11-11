from pydantic import BaseModel
from datetime import date, datetime
from uuid import UUID

class AttendanceCreate(BaseModel):
    user_id: UUID
    date: date
    service_type: str
    present: bool = True

class AttendanceResponse(BaseModel):
    id: UUID
    user_id: UUID
    date: date
    service_type: str
    present: bool
    created_at: datetime
    
    class Config:
        from_attributes = True
