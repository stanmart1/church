from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import date, datetime
from uuid import UUID

class MemberCreate(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    phone: Optional[str] = None
    address: Optional[str] = None
    birthday: Optional[date] = None
    gender: Optional[str] = None
    marital_status: Optional[str] = None

class MemberUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    birthday: Optional[date] = None
    gender: Optional[str] = None
    marital_status: Optional[str] = None
    membership_status: Optional[str] = None

class MemberResponse(BaseModel):
    id: UUID
    first_name: str
    last_name: str
    email: str
    phone: Optional[str]
    address: Optional[str]
    birthday: Optional[date]
    gender: Optional[str]
    marital_status: Optional[str]
    date_joined: date
    membership_status: str
    created_at: datetime
    
    class Config:
        from_attributes = True
