from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.models.livestream import Livestream, ChatMessage
from app.schemas.livestream import LivestreamCreate, LivestreamUpdate
from app.core.exceptions import NotFoundException

async def get_current_livestream(db: AsyncSession):
    result = await db.execute(
        select(Livestream).where(Livestream.is_live == True).order_by(Livestream.created_at.desc()).limit(1)
    )
    return result.scalar_one_or_none()

async def get_livestream(db: AsyncSession, livestream_id: str):
    result = await db.execute(select(Livestream).where(Livestream.id == livestream_id))
    livestream = result.scalar_one_or_none()
    if not livestream:
        raise NotFoundException("Livestream not found")
    return livestream

async def create_livestream(db: AsyncSession, data: LivestreamCreate):
    livestream = Livestream(**data.model_dump())
    db.add(livestream)
    await db.commit()
    await db.refresh(livestream)
    return livestream

async def update_livestream(db: AsyncSession, livestream_id: str, data: LivestreamUpdate):
    livestream = await get_livestream(db, livestream_id)
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(livestream, key, value)
    await db.commit()
    await db.refresh(livestream)
    return livestream

async def start_livestream(db: AsyncSession, livestream_id: str):
    from datetime import datetime
    livestream = await get_livestream(db, livestream_id)
    livestream.is_live = True
    livestream.start_time = datetime.utcnow()
    await db.commit()
    await db.refresh(livestream)
    return livestream

async def stop_livestream(db: AsyncSession, livestream_id: str):
    from datetime import datetime
    livestream = await get_livestream(db, livestream_id)
    livestream.is_live = False
    livestream.end_time = datetime.utcnow()
    await db.commit()
    await db.refresh(livestream)
    return livestream

async def get_chat_messages(db: AsyncSession, livestream_id: str, limit: int = 50):
    result = await db.execute(
        select(ChatMessage)
        .where(ChatMessage.livestream_id == livestream_id)
        .order_by(ChatMessage.created_at.desc())
        .limit(limit)
    )
    return result.scalars().all()
