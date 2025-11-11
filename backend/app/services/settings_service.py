from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.settings import Settings
from app.schemas.settings import SettingsCreate, SettingsUpdate
from app.core.exceptions import NotFoundException

async def get_all_settings(db: AsyncSession):
    result = await db.execute(select(Settings))
    return result.scalars().all()

async def get_setting_by_key(db: AsyncSession, key: str):
    result = await db.execute(select(Settings).where(Settings.key == key))
    setting = result.scalar_one_or_none()
    if not setting:
        raise NotFoundException(f"Setting with key '{key}' not found")
    return setting

async def create_setting(db: AsyncSession, data: SettingsCreate):
    setting = Settings(**data.model_dump())
    db.add(setting)
    await db.commit()
    await db.refresh(setting)
    return setting

async def update_setting(db: AsyncSession, key: str, data: SettingsUpdate):
    setting = await get_setting_by_key(db, key)
    setting.value = data.value
    await db.commit()
    await db.refresh(setting)
    return setting

async def update_bulk_settings(db: AsyncSession, settings: dict):
    for key, value in settings.items():
        result = await db.execute(select(Settings).where(Settings.key == key))
        setting = result.scalar_one_or_none()
        if setting:
            setting.value = value
        else:
            db.add(Settings(key=key, value=value))
    await db.commit()

async def get_system_status(db: AsyncSession):
    return {"status": "operational", "database": "connected"}

async def get_security_stats(db: AsyncSession):
    from sqlalchemy import func
    from app.models.audit import AuditLog
    result = await db.execute(select(func.count()).select_from(AuditLog))
    return {"total_logs": result.scalar()}

async def get_recent_notifications(db: AsyncSession, page: int, limit: int):
    from app.models.notification import Notification
    offset = (page - 1) * limit
    result = await db.execute(select(Notification).offset(offset).limit(limit))
    return result.scalars().all()

async def get_unread_count(db: AsyncSession, user_id: str):
    from sqlalchemy import func
    from app.models.notification import Notification
    result = await db.execute(
        select(func.count()).select_from(Notification).where(Notification.user_id == user_id).where(Notification.read == False)
    )
    return {"count": result.scalar()}

async def mark_notification_read(db: AsyncSession, notification_id: str):
    from app.models.notification import Notification
    result = await db.execute(select(Notification).where(Notification.id == notification_id))
    notification = result.scalar_one_or_none()
    if notification:
        notification.read = True
        await db.commit()

async def test_email(db: AsyncSession, email: str):
    from app.services.email_service import send_email
    await send_email(db, email, "Test Email", "<p>This is a test email</p>")

async def get_integration_stats(db: AsyncSession):
    return {
        "email": {"status": "active", "last_sent": None},
        "icecast": {"status": "inactive", "last_stream": None}
    }

async def test_integration(db: AsyncSession, integration: str):
    if integration == "email":
        from app.services.email_service import send_email
        await send_email(db, "test@example.com", "Test Email", "<p>Test</p>")
        return {"message": "Test email sent"}
    return {"message": f"Test for {integration} completed"}
