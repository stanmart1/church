from pydantic import BaseModel
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
