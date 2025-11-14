from pydantic import BaseModel
from typing import Optional
from datetime import datetime
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
    time: str
    service: Optional[str] = None
    description: Optional[str] = None

class ServiceTimeUpdate(BaseModel):
    day: Optional[str] = None
    time: Optional[str] = None
    service: Optional[str] = None
    description: Optional[str] = None

class ServiceTimeResponse(BaseModel):
    id: UUID
    day: str
    time: str
    service: Optional[str]
    description: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True
