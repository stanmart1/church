from typing import List
from fastapi import Depends, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.exceptions import UnauthorizedException, ForbiddenException
from app.core.rbac import has_permission
from app.utils.auth import decode_token

security = HTTPBearer()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    
    try:
        payload = decode_token(token)
        if payload.get("type") != "access":
            raise UnauthorizedException("Invalid token type")
        return payload
    except JWTError:
        raise UnauthorizedException("Invalid or expired token")

def require_roles(allowed_roles: List[str]):
    async def role_checker(current_user: dict = Depends(get_current_user)):
        if current_user["role"] not in allowed_roles:
            raise ForbiddenException("Insufficient permissions")
        return current_user
    return role_checker

def require_permission(permission: str):
    async def permission_checker(current_user: dict = Depends(get_current_user)):
        if not has_permission(current_user["role"], permission):
            raise ForbiddenException(f"Missing permission: {permission}")
        return current_user
    return permission_checker

async def get_admin_user(current_user: dict = Depends(get_current_user)):
    if current_user["role"] not in ["admin", "superadmin"]:
        raise ForbiddenException("Admin access required")
    return current_user

async def get_superadmin_user(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "superadmin":
        raise ForbiddenException("Superadmin access required")
    return current_user
