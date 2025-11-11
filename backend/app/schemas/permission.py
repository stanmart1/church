from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import UUID

class PermissionCreate(BaseModel):
    name: str
    description: Optional[str] = None

class PermissionResponse(BaseModel):
    id: UUID
    name: str
    description: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True

class RolePermissionCreate(BaseModel):
    role: str
    permission_id: UUID

class RolePermissionResponse(BaseModel):
    id: UUID
    role: str
    permission_id: UUID
    created_at: datetime
    
    class Config:
        from_attributes = True
