from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from app.core.database import get_db
from app.core.deps import get_admin_user
from app.core.rbac import ROLE_PERMISSIONS
from pydantic import BaseModel
from uuid import UUID
from datetime import datetime

router = APIRouter(prefix="/roles", tags=["Roles"])

class RoleCreate(BaseModel):
    name: str
    description: Optional[str] = None

class RoleUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None

class RoleResponse(BaseModel):
    id: UUID
    name: str
    description: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True

@router.get("")
async def get_roles(current_user: dict = Depends(get_admin_user)):
    return [{"name": role, "permissions": perms} for role, perms in ROLE_PERMISSIONS.items()]

@router.get("/permissions")
async def get_permissions(current_user: dict = Depends(get_admin_user)):
    all_permissions = set()
    for perms in ROLE_PERMISSIONS.values():
        all_permissions.update(perms)
    return {"permissions": sorted(list(all_permissions))}

@router.get("/{role}/permissions")
async def get_role_permissions(role: str, current_user: dict = Depends(get_admin_user)):
    return {"role": role, "permissions": ROLE_PERMISSIONS.get(role, [])}


