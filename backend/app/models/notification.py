from sqlalchemy import Column, String, Text, Boolean, TIMESTAMP, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid
from app.core.database import Base

class Notification(Base):
    __tablename__ = "notifications"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    type = Column(String(100), nullable=False)
    message = Column(Text, nullable=False)
    status = Column(String(50), default="pending")
    recipient_email = Column(String(255))
    recipient_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), index=True)
    read = Column(Boolean, default=False, index=True)
    link = Column(Text)
    created_at = Column(TIMESTAMP, default=datetime.utcnow, index=True)
