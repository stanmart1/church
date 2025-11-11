from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from app.core.database import get_db
from app.core.deps import get_admin_user
from app.core.rbac import ROLE_PERMISSIONS
from pydantic import BaseModel

router = APIRouter(prefix="/permissions", tags=["Permissions"])

class PermissionUpdate(BaseModel):
    permissions: List[str]

@router.get("/")
async def get_permissions(current_user: dict = Depends(get_admin_user)):
    all_permissions = set()
    for perms in ROLE_PERMISSIONS.values():
        all_permissions.update(perms)
    return {"permissions": sorted(list(all_permissions))}

@router.get("/role/{role}")
async def get_role_permissions(role: str, current_user: dict = Depends(get_admin_user)):
    return {"role": role, "permissions": ROLE_PERMISSIONS.get(role, [])}

@router.put("/role/{role}")
async def update_role_permissions(role: str, data: PermissionUpdate, db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_admin_user)):
    from sqlalchemy import select, update
    from app.models.permission import RolePermission
    await db.execute(update(RolePermission).where(RolePermission.role == role).values(permissions=data.permissions))
    await db.commit()
    return {"message": "Permissions updated"}
