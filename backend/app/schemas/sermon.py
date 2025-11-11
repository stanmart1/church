from pydantic import BaseModel
from typing import Optional, List
from datetime import date, datetime
from uuid import UUID

class SermonSeriesCreate(BaseModel):
    name: str
    description: Optional[str] = None

class SermonSeriesResponse(BaseModel):
    id: UUID
    name: str
    description: Optional[str]
    sermon_count: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class SermonCreate(BaseModel):
    title: str
    speaker: str
    date: date
    duration: Optional[str] = None
    description: Optional[str] = None
    series_id: Optional[UUID] = None
    tags: Optional[List[str]] = None

class SermonUpdate(BaseModel):
    title: Optional[str] = None
    speaker: Optional[str] = None
    date: Optional[date] = None
    duration: Optional[str] = None
    description: Optional[str] = None
    series_id: Optional[UUID] = None
    audio_url: Optional[str] = None
    video_url: Optional[str] = None
    thumbnail_url: Optional[str] = None
    tags: Optional[List[str]] = None

class SermonResponse(BaseModel):
    id: UUID
    title: str
    speaker: str
    date: date
    duration: Optional[str]
    description: Optional[str]
    series_id: Optional[UUID]
    audio_url: Optional[str]
    video_url: Optional[str]
    thumbnail_url: Optional[str]
    plays: int
    downloads: int
    tags: Optional[List[str]]
    created_at: datetime
    
    class Config:
        from_attributes = True
