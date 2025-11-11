from sqlalchemy import Column, String, Text, TIMESTAMP, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid
from app.core.database import Base

class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    event = Column(String(255), nullable=False)
    user_email = Column(String(255), index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), index=True)
    ip_address = Column(String(50))
    device = Column(String(100))
    severity = Column(String(20), index=True)
    details = Column(Text)
    created_at = Column(TIMESTAMP, default=datetime.utcnow, index=True)

class TokenBlacklist(Base):
    __tablename__ = "token_blacklist"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    created_at = Column(TIMESTAMP, default=datetime.utcnow, index=True)
