from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import UUID

class PlaylistCreate(BaseModel):
    title: str
    description: Optional[str] = None
    member_id: str
    name: Optional[str] = None
    is_public: bool = False

class PlaylistUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    is_public: Optional[bool] = None

class PlaylistResponse(BaseModel):
    id: UUID
    name: str
    description: Optional[str]
    member_id: Optional[UUID]
    is_public: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class PlaylistSermonAdd(BaseModel):
    sermon_id: str

class SermonBookmark(BaseModel):
    member_id: str

class PlaylistSermonCreate(BaseModel):
    playlist_id: UUID
    sermon_id: UUID

class PlaylistSermonResponse(BaseModel):
    id: UUID
    playlist_id: UUID
    sermon_id: UUID
    added_at: datetime
    
    class Config:
        from_attributes = True
