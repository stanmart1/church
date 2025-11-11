from fastapi import APIRouter, Depends, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.deps import get_current_user
from app.schemas.user import UserUpdate
from app.services import auth_service
from pydantic import BaseModel

router = APIRouter(prefix="/profile", tags=["Profile"])

class PasswordChange(BaseModel):
    currentPassword: str
    newPassword: str

@router.get("/{user_id}")
async def get_profile(user_id: str, db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    return await auth_service.get_user(db, user_id)

@router.put("/{user_id}")
async def update_profile(user_id: str, data: UserUpdate, db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    return await auth_service.update_user(db, user_id, data)

@router.delete("/{user_id}")
async def delete_profile(user_id: str, db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    await auth_service.delete_user(db, user_id)
    return {"message": "Profile deleted"}

@router.post("/{user_id}/change-password")
async def change_password(user_id: str, data: PasswordChange, db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    await auth_service.change_password(db, user_id, data.currentPassword, data.newPassword)
    return {"message": "Password changed"}

@router.post("/{user_id}/photo")
async def upload_profile_photo(user_id: str, photo: UploadFile = File(...), db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    from app.services.storage_service import save_file
    photo_url = await save_file(photo, "profiles")
    await auth_service.update_user(db, user_id, UserUpdate(profile_photo=photo_url))
    return {"photo_url": photo_url}

@router.get("/{user_id}/notifications")
async def get_notification_preferences(user_id: str, db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    return await auth_service.get_notification_preferences(db, user_id)

@router.put("/{user_id}/notifications")
async def update_notification_preferences(user_id: str, preferences: dict, db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    await auth_service.update_notification_preferences(db, user_id, preferences)
    return {"message": "Preferences updated"}
