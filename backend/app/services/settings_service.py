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
