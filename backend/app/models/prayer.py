from sqlalchemy import Column, String, Date, Text, Integer, ForeignKey, TIMESTAMP, Boolean
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid
from app.core.database import Base

class PrayerRequest(Base):
    __tablename__ = "prayer_requests"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    author = Column(String(255))
    member_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), index=True)
    date = Column(Date, nullable=False, default=datetime.utcnow)
    status = Column(String(50), nullable=False, default="active", index=True)
    prayers = Column(Integer, default=0)
    is_private = Column(Boolean, default=False)
    created_at = Column(TIMESTAMP, default=datetime.utcnow)
    updated_at = Column(TIMESTAMP, default=datetime.utcnow, onupdate=datetime.utcnow)
