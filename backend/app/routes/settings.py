from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Dict
from app.core.database import get_db
from app.core.deps import get_current_user
from app.schemas.settings import SettingUpdate
from app.services import settings_service
from app.models.user import User

router = APIRouter(prefix="/settings", tags=["Settings"])

@router.get("/")
async def get_settings(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    return await settings_service.get_all_settings(db)

@router.get("/system/status")
async def get_system_status(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    return await settings_service.get_system_status(db)

@router.get("/security/stats")
async def get_security_stats(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    return await settings_service.get_security_stats(db)

@router.get("/notifications/recent")
async def get_recent_notifications(page: int = 1, limit: int = 10, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    return await settings_service.get_recent_notifications(db, page, limit)

@router.get("/notifications/unread-count")
async def get_unread_count(db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    return await settings_service.get_unread_count(db, current_user["userId"])

@router.put("/notifications/{notification_id}/read")
async def mark_notification_read(notification_id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    await settings_service.mark_notification_read(db, notification_id)
    return {"message": "Notification marked as read"}

@router.post("/notifications/test-email")
async def test_email(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    await settings_service.test_email(db, current_user.email)
    return {"message": "Test email sent"}

@router.get("/{key}")
async def get_setting_by_key(key: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    return await settings_service.get_setting_by_key(db, key)

@router.put("/{key}")
async def update_setting(key: str, data: SettingUpdate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    return await settings_service.update_setting(db, key, data)

@router.post("/bulk")
async def update_bulk_settings(settings: Dict[str, str], db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    await settings_service.update_bulk_settings(db, settings)
    return {"message": "Settings updated"}

@router.get("/integrations/stats")
async def get_integration_stats(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    return await settings_service.get_integration_stats(db)

@router.post("/integrations/{integration}/test")
async def test_integration(integration: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    return await settings_service.test_integration(db, integration)
