from sqlalchemy import Column, String, Text, Integer, TIMESTAMP
from datetime import datetime
from app.core.database import Base

class ServiceTime(Base):
    __tablename__ = "service_times"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    day = Column(String(50), nullable=False)
    time = Column(String(50), nullable=False)
    service = Column(String(255), nullable=False)
    description = Column(Text)
    created_at = Column(TIMESTAMP, default=datetime.utcnow)
    updated_at = Column(TIMESTAMP, default=datetime.utcnow, onupdate=datetime.utcnow)
