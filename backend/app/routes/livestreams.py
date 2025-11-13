from fastapi import APIRouter, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.deps import get_current_user
from app.schemas.livestream import LivestreamCreate, LivestreamUpdate, LivestreamResponse
from typing import Dict
from app.services import livestream_service
from app.services.icecast_service import icecast_service
from app.models.user import User

router = APIRouter(prefix="/livestreams", tags=["Livestreams"])

@router.get("/current")
async def get_current_livestream(db: AsyncSession = Depends(get_db)):
    return await livestream_service.get_current_livestream(db)

@router.post("", response_model=LivestreamResponse, status_code=201)
async def create_livestream(data: LivestreamCreate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    return await livestream_service.create_livestream(db, data)

@router.put("/{livestream_id}", response_model=LivestreamResponse)
async def update_livestream(livestream_id: str, data: LivestreamUpdate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    return await livestream_service.update_livestream(db, livestream_id, data)

@router.post("/{livestream_id}/end")
async def end_livestream(livestream_id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    await livestream_service.stop_livestream(db, livestream_id)
    return {"message": "Livestream ended"}

@router.get("/history")
async def get_stream_history(db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    return await livestream_service.get_stream_history(db)

@router.get("/{livestream_id}/chat")
async def get_chat_messages(livestream_id: str, limit: int = 50, db: AsyncSession = Depends(get_db)):
    return await livestream_service.get_chat_messages(db, livestream_id, limit)

@router.delete("/{livestream_id}/chat/{message_id}")
async def delete_chat_message(livestream_id: str, message_id: str, db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    await livestream_service.delete_chat_message(db, message_id)
    return {"message": "Chat message deleted"}

@router.get("/{livestream_id}/viewers")
async def get_viewers(livestream_id: str, db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    return await livestream_service.get_viewers(db, livestream_id)

@router.post("/{livestream_id}/viewers")
async def add_viewer(livestream_id: str, data: dict, db: AsyncSession = Depends(get_db)):
    return await livestream_service.add_viewer(db, livestream_id, data)

@router.delete("/{livestream_id}/viewers/{viewer_id}")
async def remove_viewer(livestream_id: str, viewer_id: str, db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    await livestream_service.remove_viewer(db, viewer_id)
    return {"message": "Viewer removed"}

@router.post("/{livestream_id}/viewers/{viewer_id}/ban")
async def ban_viewer(livestream_id: str, viewer_id: str, db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    await livestream_service.ban_viewer(db, viewer_id)
    return {"message": "Viewer banned"}

@router.post("/{livestream_id}/viewers/{viewer_id}/unban")
async def unban_viewer(livestream_id: str, viewer_id: str, db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    await livestream_service.unban_viewer(db, viewer_id)
    return {"message": "Viewer unbanned"}

@router.post("/{livestream_id}/viewers/bulk-action")
async def bulk_viewer_action(livestream_id: str, data: dict, db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    await livestream_service.bulk_viewer_action(db, data)
    return {"message": "Bulk action completed"}

@router.get("/{livestream_id}/stats")
async def get_stream_stats(livestream_id: str, db: AsyncSession = Depends(get_db)):
    return await livestream_service.get_stream_stats(db, livestream_id)

@router.get("/{livestream_id}/icecast-url")
async def get_icecast_url(livestream_id: str, db: AsyncSession = Depends(get_db)):
    return {"stream_url": icecast_service.get_stream_url()}

@router.get("/{livestream_id}/source-url")
async def get_source_url(livestream_id: str, db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    return {"source_url": icecast_service.get_source_url()}

@router.get("/icecast/status")
async def check_icecast_status(current_user: dict = Depends(get_current_user)):
    is_connected = await icecast_service.check_connection()
    source_connected = await icecast_service.is_source_connected()
    return {
        "connected": is_connected,
        "source_connected": source_connected,
        "stream_url": icecast_service.get_stream_url()
    }

@router.get("/icecast/butt-config")
async def get_butt_config(current_user: dict = Depends(get_current_user)):
    return icecast_service.get_butt_config()

@router.post("/{livestream_id}/update-metadata")
async def update_stream_metadata(livestream_id: str, data: dict, db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    title = data.get("title", "")
    await icecast_service.update_metadata(title)
    
    livestream = await livestream_service.get_livestream(db, livestream_id)
    if "title" in data:
        livestream.title = data["title"]
    if "description" in data:
        livestream.description = data["description"]
    await db.commit()
    
    return {"message": "Metadata updated"}


