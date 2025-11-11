from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.content import Content
from app.schemas.content import ContentCreate, ContentUpdate
from app.core.exceptions import NotFoundException

async def get_all_content(db: AsyncSession):
    result = await db.execute(select(Content))
    return result.scalars().all()

async def get_content_by_key(db: AsyncSession, key: str):
    result = await db.execute(select(Content).where(Content.key == key))
    content = result.scalar_one_or_none()
    if not content:
        raise NotFoundException(f"Content with key '{key}' not found")
    return content

async def create_content(db: AsyncSession, data: ContentCreate):
    content = Content(**data.model_dump())
    db.add(content)
    await db.commit()
    await db.refresh(content)
    return content

async def update_content(db: AsyncSession, key: str, data: ContentUpdate):
    content = await get_content_by_key(db, key)
    content.value = data.value
    await db.commit()
    await db.refresh(content)
    return content
