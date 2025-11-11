from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import date, datetime
from uuid import UUID

class FormCreate(BaseModel):
    title: str
    description: Optional[str] = None
    type: str
    fields: Dict[str, Any]
    is_public: bool = True
    deadline: Optional[date] = None
    allow_multiple: bool = False
    require_login: bool = True

class FormUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    fields: Optional[Dict[str, Any]] = None

class FormResponse(BaseModel):
    id: UUID
    title: str
    description: Optional[str]
    type: str
    status: str
    fields: Dict[str, Any]
    responses: int
    is_public: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class FormResponseCreate(BaseModel):
    form_id: UUID
    member_id: Optional[UUID] = None
    responses: Dict[str, Any]

class FormResponseResponse(BaseModel):
    id: UUID
    form_id: UUID
    member_id: Optional[UUID]
    responses: Dict[str, Any]
    submitted_at: datetime
    
    class Config:
        from_attributes = True
