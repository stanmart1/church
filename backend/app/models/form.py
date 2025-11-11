from sqlalchemy import Column, String, Text, Integer, Date, Boolean, TIMESTAMP, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from datetime import datetime
import uuid
from app.core.database import Base

class Form(Base):
    __tablename__ = "forms"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    type = Column(String(50), nullable=False)
    status = Column(String(50), nullable=False, default="active", index=True)
    fields = Column(JSONB, nullable=False)
    responses = Column(Integer, default=0)
    is_public = Column(Boolean, default=True)
    deadline = Column(Date)
    allow_multiple = Column(Boolean, default=False)
    require_login = Column(Boolean, default=True)
    template = Column(String(50))
    created_at = Column(TIMESTAMP, default=datetime.utcnow)
    updated_at = Column(TIMESTAMP, default=datetime.utcnow, onupdate=datetime.utcnow)

class FormResponse(Base):
    __tablename__ = "form_responses"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    form_id = Column(UUID(as_uuid=True), ForeignKey("forms.id", ondelete="CASCADE"), nullable=False, index=True)
    member_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    responses = Column(JSONB, nullable=False)
    submitted_at = Column(TIMESTAMP, default=datetime.utcnow)
