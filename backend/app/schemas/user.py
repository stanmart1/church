from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import date, datetime
from uuid import UUID

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    phone: Optional[str] = None
    role: Optional[str] = 'member'
    status: Optional[str] = 'active'

class UserUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    birthday: Optional[date] = None
    gender: Optional[str] = None
    marital_status: Optional[str] = None

class UserResponse(BaseModel):
    id: UUID
    name: str
    email: str
    role: str
    phone: Optional[str]
    address: Optional[str]
    date_joined: date
    membership_status: str
    birthday: Optional[date]
    gender: Optional[str]
    marital_status: Optional[str]
    status: str
    created_at: datetime
    
    class Config:
        from_attributes = True
