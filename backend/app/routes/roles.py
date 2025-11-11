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

@router.get("/")
async def get_roles(db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_admin_user)):
    from sqlalchemy import select
    from app.models.permission import Role
    result = await db.execute(select(Role))
    return result.scalars().all()

@router.get("/permissions")
async def get_permissions(current_user: dict = Depends(get_admin_user)):
    all_permissions = set()
    for perms in ROLE_PERMISSIONS.values():
        all_permissions.update(perms)
    return {"permissions": sorted(list(all_permissions))}

@router.get("/{role}/permissions")
async def get_role_permissions(role: str, current_user: dict = Depends(get_admin_user)):
    return {"role": role, "permissions": ROLE_PERMISSIONS.get(role, [])}

@router.get("/{role_id}", response_model=RoleResponse)
async def get_role(role_id: str, db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_admin_user)):
    from sqlalchemy import select
    from app.models.permission import Role
    from app.core.exceptions import NotFoundException
    result = await db.execute(select(Role).where(Role.id == role_id))
    role = result.scalar_one_or_none()
    if not role:
        raise NotFoundException("Role not found")
    return role

@router.post("/", response_model=RoleResponse, status_code=201)
async def create_role(data: RoleCreate, db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_admin_user)):
    from app.models.permission import Role
    role = Role(**data.model_dump())
    db.add(role)
    await db.commit()
    await db.refresh(role)
    return role

@router.put("/{role_id}", response_model=RoleResponse)
async def update_role(role_id: str, data: RoleUpdate, db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_admin_user)):
    from sqlalchemy import select
    from app.models.permission import Role
    from app.core.exceptions import NotFoundException
    result = await db.execute(select(Role).where(Role.id == role_id))
    role = result.scalar_one_or_none()
    if not role:
        raise NotFoundException("Role not found")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(role, key, value)
    await db.commit()
    await db.refresh(role)
    return role

@router.delete("/{role_id}")
async def delete_role(role_id: str, db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_admin_user)):
    from sqlalchemy import select, delete
    from app.models.permission import Role
    from app.core.exceptions import NotFoundException
    result = await db.execute(select(Role).where(Role.id == role_id))
    if not result.scalar_one_or_none():
        raise NotFoundException("Role not found")
    await db.execute(delete(Role).where(Role.id == role_id))
    await db.commit()
    return {"message": "Role deleted"}
