from sqlalchemy import Column, String, Date, Text, Enum as SQLEnum, TIMESTAMP
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid
from app.core.database import Base
from app.core.constants import UserRole, MembershipStatus, UserStatus

class User(Base):
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False, index=True)
    phone = Column(String(50))
    address = Column(Text)
    date_joined = Column(Date, nullable=False, default=datetime.utcnow)
    membership_status = Column(String(50), nullable=False, default="active", index=True)
    birthday = Column(Date)
    gender = Column(String(20))
    marital_status = Column(String(50))
    status = Column(String(50), nullable=False, default="active")
    created_at = Column(TIMESTAMP, default=datetime.utcnow)
    updated_at = Column(TIMESTAMP, default=datetime.utcnow, onupdate=datetime.utcnow)
