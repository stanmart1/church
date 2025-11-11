from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from uuid import UUID

class StreamViewerCreate(BaseModel):
    livestream_id: UUID
    name: str
    location: Optional[str] = None
    user_id: Optional[UUID] = None

class StreamViewerResponse(BaseModel):
    id: int
    livestream_id: UUID
    user_id: Optional[UUID]
    name: str
    location: Optional[str]
    status: str
    joined_at: datetime
    
    class Config:
        from_attributes = True

class SermonDownloadCreate(BaseModel):
    sermon_id: UUID
    user_id: UUID

class SermonDownloadResponse(BaseModel):
    id: UUID
    sermon_id: UUID
    user_id: UUID
    downloaded_at: datetime
    
    class Config:
        from_attributes = True

class ModerationLogCreate(BaseModel):
    action: str
    viewer_ids: List[str]
    note: Optional[str] = None

class ModerationLogResponse(BaseModel):
    id: int
    action: str
    viewer_ids: List[str]
    note: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True
