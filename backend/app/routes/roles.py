from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, text
from typing import Optional
from app.core.database import get_db
from app.core.deps import get_admin_user
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
async def get_roles(db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_admin_user)):
    result = await db.execute(text("""
        SELECT DISTINCT role FROM role_permissions ORDER BY role
    """))
    roles = []
    for row in result:
        role_name = row[0]
        perms_result = await db.execute(text("""
            SELECT p.name FROM role_permissions rp
            JOIN permissions p ON rp.permission_id = p.id
            WHERE rp.role = :role
        """), {"role": role_name})
        permissions = [p[0] for p in perms_result]
        roles.append({"name": role_name, "permissions": permissions})
    return roles

@router.get("/permissions")
async def get_permissions(db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_admin_user)):
    result = await db.execute(text("SELECT id, name, description FROM permissions ORDER BY name"))
    permissions = [{"id": row[0], "name": row[1], "description": row[2]} for row in result]
    return {"permissions": permissions}

@router.get("/{role}/permissions")
async def get_role_permissions(role: str, db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_admin_user)):
    result = await db.execute(text("""
        SELECT p.id, p.name, p.description FROM role_permissions rp
        JOIN permissions p ON rp.permission_id = p.id
        WHERE rp.role = :role
    """), {"role": role})
    permissions = [{"id": row[0], "name": row[1], "description": row[2]} for row in result]
    return {"role": role, "permissions": permissions}

@router.put("/{role}")
async def update_role(role: str, data: dict, db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_admin_user)):
    permissions = data.get("permissions", [])
    await db.execute(text("DELETE FROM role_permissions WHERE role = :role"), {"role": role})
    for perm_name in permissions:
        perm_result = await db.execute(text("SELECT id FROM permissions WHERE name = :name"), {"name": perm_name})
        perm_id = perm_result.scalar()
        if perm_id:
            await db.execute(text("INSERT INTO role_permissions (id, role, permission_id) VALUES (gen_random_uuid(), :role, :perm_id)"), {"role": role, "perm_id": perm_id})
    await db.commit()
    return {"message": "Role updated"}


