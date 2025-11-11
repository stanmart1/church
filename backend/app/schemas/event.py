from pydantic import BaseModel
from typing import Optional
from datetime import date, time, datetime
from uuid import UUID
from decimal import Decimal

class EventCreate(BaseModel):
    title: str
    description: Optional[str] = None
    date: date
    start_time: time
    end_time: time
    location: str
    type: str
    capacity: Optional[int] = None
    recurring: Optional[bool] = False
    recurring_type: Optional[str] = None
    registration_deadline: Optional[date] = None
    cost: Optional[Decimal] = None
    organizer: Optional[str] = None

class EventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    date: Optional[date] = None
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    location: Optional[str] = None
    type: Optional[str] = None
    capacity: Optional[int] = None
    status: Optional[str] = None

class EventResponse(BaseModel):
    id: UUID
    title: str
    description: Optional[str]
    date: date
    start_time: time
    end_time: time
    location: str
    type: str
    capacity: Optional[int]
    registered_count: int
    status: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class EventRegistrationCreate(BaseModel):
    event_id: UUID
    member_id: UUID

class EventRegistrationResponse(BaseModel):
    id: UUID
    event_id: UUID
    member_id: UUID
    registered_at: datetime
    attended: bool
    
    class Config:
        from_attributes = True
