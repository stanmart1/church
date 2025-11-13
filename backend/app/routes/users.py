from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from app.core.database import get_db
from app.core.deps import get_admin_user
from app.schemas.user import UserCreate, UserUpdate, UserResponse
from app.services import auth_service
from app.models.user import User

router = APIRouter(prefix="/users", tags=["Users"])

@router.post("", response_model=UserResponse, status_code=201)
async def create_user(data: UserCreate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_admin_user)):
    return await auth_service.create_user(db, data)

@router.get("/stats")
async def get_user_stats(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_admin_user)):
    return await auth_service.get_user_stats(db)

@router.get("")
async def get_users(
    page: int = 1,
    limit: int = 10,
    search: Optional[str] = None,
    role: Optional[str] = None,
    status: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_admin_user)
):
    return await auth_service.get_users(db, page, limit, search, role, status)

@router.get("/{user_id}", response_model=UserResponse)
async def get_user(user_id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_admin_user)):
    return await auth_service.get_user(db, user_id)

@router.put("/{user_id}", response_model=UserResponse)
async def update_user(user_id: str, data: UserUpdate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_admin_user)):
    return await auth_service.update_user(db, user_id, data)

@router.delete("/{user_id}")
async def delete_user(user_id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_admin_user)):
    await auth_service.delete_user(db, user_id)
    return {"message": "User deleted"}

@router.post("/{user_id}/reset-password")
async def reset_password(user_id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_admin_user)):
    await auth_service.reset_password(db, user_id)
    return {"message": "Password reset"}
