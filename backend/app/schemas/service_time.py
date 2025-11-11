from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ServiceTimeCreate(BaseModel):
    day: str
    time: str
    service: str
    description: Optional[str] = None

class ServiceTimeUpdate(BaseModel):
    day: Optional[str] = None
    time: Optional[str] = None
    service: Optional[str] = None
    description: Optional[str] = None

class ServiceTimeResponse(BaseModel):
    id: int
    day: str
    time: str
    service: str
    description: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True
