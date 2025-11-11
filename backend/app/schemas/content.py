from pydantic import BaseModel
from typing import Optional
from datetime import datetime, time
from uuid import UUID

class ContentCreate(BaseModel):
    key: str
    value: str

class ContentUpdate(BaseModel):
    value: str

class ContentResponse(BaseModel):
    id: UUID
    key: str
    value: str
    updated_at: datetime
    
    class Config:
        from_attributes = True

class ServiceTimeCreate(BaseModel):
    day: str
    time: time
    description: Optional[str] = None

class ServiceTimeUpdate(BaseModel):
    day: Optional[str] = None
    time: Optional[time] = None
    description: Optional[str] = None

class ServiceTimeResponse(BaseModel):
    id: UUID
    day: str
    time: time
    description: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True
