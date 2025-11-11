from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from app.core.database import get_db
from app.core.deps import get_current_user
from app.schemas.playlist import PlaylistCreate, PlaylistUpdate, PlaylistResponse, PlaylistSermonAdd, SermonBookmark
from app.services import playlist_service
from app.models.user import User

router = APIRouter(prefix="/playlists", tags=["Playlists"])

@router.get("")
async def get_playlists(member_id: Optional[str] = None, db: AsyncSession = Depends(get_db)):
    return await playlist_service.get_playlists(db, member_id)

@router.get("/{playlist_id}", response_model=PlaylistResponse)
async def get_playlist(playlist_id: str, db: AsyncSession = Depends(get_db)):
    return await playlist_service.get_playlist(db, playlist_id)

@router.post("/", response_model=PlaylistResponse, status_code=201)
async def create_playlist(data: PlaylistCreate, db: AsyncSession = Depends(get_db)):
    return await playlist_service.create_playlist(db, data)

@router.put("/{playlist_id}", response_model=PlaylistResponse)
async def update_playlist(playlist_id: str, data: PlaylistUpdate, db: AsyncSession = Depends(get_db)):
    return await playlist_service.update_playlist(db, playlist_id, data)

@router.delete("/{playlist_id}")
async def delete_playlist(playlist_id: str, db: AsyncSession = Depends(get_db)):
    await playlist_service.delete_playlist(db, playlist_id)
    return {"message": "Playlist deleted"}

@router.post("/{playlist_id}/sermons")
async def add_sermon_to_playlist(playlist_id: str, data: PlaylistSermonAdd, db: AsyncSession = Depends(get_db)):
    await playlist_service.add_sermon_to_playlist(db, playlist_id, data.sermon_id)
    return {"message": "Sermon added to playlist"}

@router.delete("/{playlist_id}/sermons/{sermon_id}")
async def remove_sermon_from_playlist(playlist_id: str, sermon_id: str, db: AsyncSession = Depends(get_db)):
    await playlist_service.remove_sermon_from_playlist(db, playlist_id, sermon_id)
    return {"message": "Sermon removed from playlist"}

@router.post("/{playlist_id}/play")
async def increment_plays(playlist_id: str, db: AsyncSession = Depends(get_db)):
    await playlist_service.increment_plays(db, playlist_id)
    return {"message": "Play count incremented"}

@router.post("/bookmark/{sermon_id}")
async def toggle_sermon_bookmark(sermon_id: str, data: SermonBookmark, db: AsyncSession = Depends(get_db)):
    await playlist_service.toggle_sermon_bookmark(db, sermon_id, data.member_id)
    return {"message": "Bookmark toggled"}
