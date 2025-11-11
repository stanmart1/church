from sqlalchemy import Column, String, Date, Text, Numeric, ForeignKey, TIMESTAMP, CheckConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
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
    
    __table_args__ = (
        CheckConstraint("type IN ('tithe', 'offering', 'missions', 'building_fund', 'special')", name='giving_type_check'),
        CheckConstraint("method IN ('cash', 'check', 'online', 'card')", name='giving_method_check'),
    )
    
    member = relationship("User", back_populates="giving_records")
