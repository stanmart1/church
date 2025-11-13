from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from typing import List
from app.core.database import get_db
from app.core.deps import get_admin_user
from pydantic import BaseModel

router = APIRouter(prefix="/permissions", tags=["Permissions"])

class PermissionUpdate(BaseModel):
    permissions: List[str]

@router.get("/")
async def get_permissions(db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_admin_user)):
    result = await db.execute(text("SELECT id, name, description FROM permissions ORDER BY name"))
    permissions = [{"id": str(row[0]), "name": row[1], "description": row[2]} for row in result]
    return {"permissions": permissions}

@router.get("/role/{role}")
async def get_role_permissions(role: str, db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_admin_user)):
    result = await db.execute(text("""
        SELECT p.id, p.name, p.description FROM role_permissions rp
        JOIN permissions p ON rp.permission_id = p.id
        WHERE rp.role = :role
    """), {"role": role})
    permissions = [{"id": str(row[0]), "name": row[1], "description": row[2]} for row in result]
    return {"role": role, "permissions": permissions}

@router.put("/role/{role}")
async def update_role_permissions(role: str, data: PermissionUpdate, db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_admin_user)):
    await db.execute(text("DELETE FROM role_permissions WHERE role = :role"), {"role": role})
    for perm_name in data.permissions:
        perm_result = await db.execute(text("SELECT id FROM permissions WHERE name = :name"), {"name": perm_name})
        perm_id = perm_result.scalar()
        if perm_id:
            await db.execute(text("INSERT INTO role_permissions (id, role, permission_id) VALUES (gen_random_uuid(), :role, :perm_id)"), {"role": role, "perm_id": perm_id})
    await db.commit()
    return {"message": "Permissions updated"}
