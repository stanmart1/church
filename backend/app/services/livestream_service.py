from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.models.livestream import Livestream, ChatMessage
from app.schemas.livestream import LivestreamCreate, LivestreamUpdate
from app.core.exceptions import NotFoundException

async def get_current_livestream(db: AsyncSession):
    result = await db.execute(
        select(Livestream).where(Livestream.is_live == True).order_by(Livestream.created_at.desc()).limit(1)
    )
    livestream = result.scalar_one_or_none()
    if not livestream:
        return {"is_live": False}
    return livestream

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

async def delete_chat_message(db: AsyncSession, message_id: str):
    from sqlalchemy import delete
    await db.execute(delete(ChatMessage).where(ChatMessage.id == message_id))
    await db.commit()

async def get_stream_history(db: AsyncSession):
    result = await db.execute(
        select(Livestream).where(Livestream.is_live == False).order_by(Livestream.created_at.desc()).limit(50)
    )
    return result.scalars().all()

async def get_viewers(db: AsyncSession, livestream_id: str):
    from app.models.stream import StreamViewer
    result = await db.execute(
        select(StreamViewer).where(StreamViewer.livestream_id == livestream_id)
    )
    return result.scalars().all()

async def add_viewer(db: AsyncSession, livestream_id: str, data: dict):
    from app.models.stream import StreamViewer
    viewer = StreamViewer(livestream_id=livestream_id, **data)
    db.add(viewer)
    await db.commit()
    await db.refresh(viewer)
    return viewer

async def remove_viewer(db: AsyncSession, viewer_id: str):
    from sqlalchemy import delete
    from app.models.stream import StreamViewer
    await db.execute(delete(StreamViewer).where(StreamViewer.id == viewer_id))
    await db.commit()

async def ban_viewer(db: AsyncSession, viewer_id: str):
    from app.models.stream import StreamViewer
    result = await db.execute(select(StreamViewer).where(StreamViewer.id == viewer_id))
    viewer = result.scalar_one_or_none()
    if viewer:
        viewer.status = 'kicked'
        await db.commit()

async def unban_viewer(db: AsyncSession, viewer_id: str):
    from app.models.stream import StreamViewer
    result = await db.execute(select(StreamViewer).where(StreamViewer.id == viewer_id))
    viewer = result.scalar_one_or_none()
    if viewer:
        viewer.status = 'active'
        await db.commit()

async def bulk_viewer_action(db: AsyncSession, data: dict):
    from app.models.stream import StreamViewer
    action = data.get('action')
    viewer_ids = data.get('viewer_ids', [])
    if action == 'kick':
        await db.execute(
            select(StreamViewer).where(StreamViewer.id.in_(viewer_ids))
        )
        for viewer_id in viewer_ids:
            await ban_viewer(db, viewer_id)

async def get_stream_stats(db: AsyncSession, livestream_id: str):
    from app.models.stream import StreamViewer
    livestream = await get_livestream(db, livestream_id)
    result = await db.execute(
        select(func.count()).select_from(StreamViewer).where(StreamViewer.livestream_id == livestream_id).where(StreamViewer.status == 'active')
    )
    current_viewers = result.scalar()
    chat_result = await db.execute(
        select(func.count()).select_from(ChatMessage).where(ChatMessage.livestream_id == livestream_id)
    )
    chat_messages = chat_result.scalar()
    return {
        "current_viewers": current_viewers,
        "peak_viewers": livestream.viewers,
        "chat_messages": chat_messages,
        "is_live": livestream.is_live
    }

async def stream_audio(db: AsyncSession, data: dict):
    return {"message": "Audio streaming endpoint"}
