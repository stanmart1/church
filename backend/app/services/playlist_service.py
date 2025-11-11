from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.playlist import Playlist, PlaylistSermon
from app.schemas.playlist import PlaylistCreate, PlaylistUpdate
from app.core.exceptions import NotFoundException

async def get_playlists(db: AsyncSession, member_id: str = None):
    query = select(Playlist)
    if member_id:
        query = query.where(Playlist.member_id == member_id)
    result = await db.execute(query)
    return result.scalars().all()

async def get_playlist(db: AsyncSession, playlist_id: str):
    result = await db.execute(select(Playlist).where(Playlist.id == playlist_id))
    playlist = result.scalar_one_or_none()
    if not playlist:
        raise NotFoundException("Playlist not found")
    return playlist

async def create_playlist(db: AsyncSession, data: PlaylistCreate, member_id: str):
    playlist = Playlist(**data.model_dump(), member_id=member_id)
    db.add(playlist)
    await db.commit()
    await db.refresh(playlist)
    return playlist

async def update_playlist(db: AsyncSession, playlist_id: str, data: PlaylistUpdate):
    playlist = await get_playlist(db, playlist_id)
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(playlist, key, value)
    await db.commit()
    await db.refresh(playlist)
    return playlist

async def add_sermon_to_playlist(db: AsyncSession, playlist_id: str, sermon_id: str):
    playlist_sermon = PlaylistSermon(playlist_id=playlist_id, sermon_id=sermon_id)
    db.add(playlist_sermon)
    await db.commit()
    await db.refresh(playlist_sermon)
    return playlist_sermon
