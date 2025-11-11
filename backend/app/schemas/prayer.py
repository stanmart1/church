from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime
from uuid import UUID

class PrayerRequestCreate(BaseModel):
    member_id: str
    request: str
    is_private: bool = False
    title: Optional[str] = None
    description: Optional[str] = None
    author: Optional[str] = None

class PrayerRequestUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    request: Optional[str] = None

class PrayerRequestResponse(BaseModel):
    id: UUID
    title: str
    description: Optional[str]
    author: Optional[str]
    member_id: Optional[UUID]
    date: date
    status: str
    prayers: int
    is_private: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

PrayerCreate = PrayerRequestCreate
PrayerUpdate = PrayerRequestUpdate
PrayerResponse = PrayerRequestResponse
