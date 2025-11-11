from sqlalchemy import Column, String, Integer, TIMESTAMP, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
from app.core.database import Base

class StreamViewer(Base):
    __tablename__ = "stream_viewers"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    livestream_id = Column(UUID(as_uuid=True), ForeignKey("livestreams.id"), index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    name = Column(String(255), nullable=False)
    location = Column(String(255))
    status = Column(String(50), default="active")
    joined_at = Column(TIMESTAMP, default=datetime.utcnow)

class SermonDownload(Base):
    __tablename__ = "sermon_downloads"
    
    id = Column(UUID(as_uuid=True), primary_key=True)
    sermon_id = Column(UUID(as_uuid=True), ForeignKey("sermons.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    downloaded_at = Column(TIMESTAMP, default=datetime.utcnow)

class ModerationLog(Base):
    __tablename__ = "moderation_logs"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    action = Column(String(50), nullable=False)
    viewer_ids = Column(String, nullable=False)
    note = Column(String)
    created_at = Column(TIMESTAMP, default=datetime.utcnow)
