from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import UUID

class LivestreamCreate(BaseModel):
    title: str
    description: Optional[str] = None

class LivestreamUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    is_live: Optional[bool] = None
    stream_url: Optional[str] = None

class LivestreamResponse(BaseModel):
    id: UUID
    title: str
    description: Optional[str]
    is_live: bool
    stream_url: Optional[str]
    viewers: int
    start_time: Optional[datetime]
    end_time: Optional[datetime]
    created_at: datetime
    
    class Config:
        from_attributes = True

class ChatMessageCreate(BaseModel):
    livestream_id: UUID
    user_name: str
    text: str
    user_id: Optional[UUID] = None

class ChatMessageResponse(BaseModel):
    id: UUID
    livestream_id: UUID
    user_id: Optional[UUID]
    user_name: str
    text: str
    created_at: datetime
    
    class Config:
        from_attributes = True
