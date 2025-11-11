from sqlalchemy import Column, String, Date, Text, Integer, ForeignKey, TIMESTAMP, ARRAY
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid
from app.core.database import Base

class SermonSeries(Base):
    __tablename__ = "sermon_series"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    sermon_count = Column(Integer, default=0)
    created_at = Column(TIMESTAMP, default=datetime.utcnow)

class Sermon(Base):
    __tablename__ = "sermons"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(255), nullable=False)
    speaker = Column(String(255), nullable=False, index=True)
    date = Column(Date, nullable=False, index=True)
    duration = Column(String(50))
    description = Column(Text)
    series_id = Column(UUID(as_uuid=True), ForeignKey("sermon_series.id", ondelete="SET NULL"), index=True)
    audio_url = Column(Text)
    video_url = Column(Text)
    thumbnail_url = Column(Text)
    plays = Column(Integer, default=0)
    downloads = Column(Integer, default=0)
    tags = Column(ARRAY(String))
    created_at = Column(TIMESTAMP, default=datetime.utcnow)
    updated_at = Column(TIMESTAMP, default=datetime.utcnow, onupdate=datetime.utcnow)
