from sqlalchemy import Column, String, Date, Text, ForeignKey, TIMESTAMP
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid
from app.core.database import Base

class Announcement(Base):
    __tablename__ = "announcements"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    priority = Column(String(50), nullable=False, default="medium")
    publish_date = Column(Date, nullable=False, index=True)
    expiry_date = Column(Date)
    status = Column(String(50), nullable=False, default="draft", index=True)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"))
    created_at = Column(TIMESTAMP, default=datetime.utcnow)
    updated_at = Column(TIMESTAMP, default=datetime.utcnow, onupdate=datetime.utcnow)
