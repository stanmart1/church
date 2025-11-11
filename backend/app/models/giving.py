from sqlalchemy import Column, String, Date, Text, Numeric, ForeignKey, TIMESTAMP
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid
from app.core.database import Base

class Giving(Base):
    __tablename__ = "giving"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    member_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    amount = Column(Numeric(10, 2), nullable=False)
    type = Column(String(50), nullable=False, index=True)
    method = Column(String(50), nullable=False)
    date = Column(Date, nullable=False, default=datetime.utcnow, index=True)
    notes = Column(Text)
    created_at = Column(TIMESTAMP, default=datetime.utcnow)
