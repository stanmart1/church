from sqlalchemy import Column, String, Integer, TIMESTAMP, ForeignKey, CheckConstraint
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from datetime import datetime
import uuid
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
    
    __table_args__ = (
        CheckConstraint("status IN ('active', 'inactive', 'kicked')", name='stream_viewers_status_check'),
    )

class SermonDownload(Base):
    __tablename__ = "sermon_downloads"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    sermon_id = Column(UUID(as_uuid=True), ForeignKey("sermons.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    downloaded_at = Column(TIMESTAMP, default=datetime.utcnow)

class ModerationLog(Base):
    __tablename__ = "moderation_logs"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    action = Column(String(50), nullable=False)
    viewer_ids = Column(ARRAY(String), nullable=False)
    note = Column(String)
    created_at = Column(TIMESTAMP, default=datetime.utcnow)
