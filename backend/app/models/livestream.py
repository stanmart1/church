from sqlalchemy import Column, String, Text, Integer, ForeignKey, TIMESTAMP, Boolean
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid
from app.core.database import Base

class Livestream(Base):
    __tablename__ = "livestreams"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    is_live = Column(Boolean, default=False)
    stream_url = Column(Text)
    viewers = Column(Integer, default=0)
    start_time = Column(TIMESTAMP)
    end_time = Column(TIMESTAMP)
    created_at = Column(TIMESTAMP, default=datetime.utcnow)

class ChatMessage(Base):
    __tablename__ = "chat_messages"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    livestream_id = Column(UUID(as_uuid=True), ForeignKey("livestreams.id", ondelete="CASCADE"), index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"))
    user_name = Column(String(255), nullable=False)
    text = Column(Text, nullable=False)
    created_at = Column(TIMESTAMP, default=datetime.utcnow, index=True)
