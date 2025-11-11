from sqlalchemy import Column, String, Text, Boolean, TIMESTAMP, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid
from app.core.database import Base

class Playlist(Base):
    __tablename__ = "playlists"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    member_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), index=True)
    is_public = Column(Boolean, default=False)
    created_at = Column(TIMESTAMP, default=datetime.utcnow)
    updated_at = Column(TIMESTAMP, default=datetime.utcnow, onupdate=datetime.utcnow)

class PlaylistSermon(Base):
    __tablename__ = "playlist_sermons"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    playlist_id = Column(UUID(as_uuid=True), ForeignKey("playlists.id", ondelete="CASCADE"), nullable=False, index=True)
    sermon_id = Column(UUID(as_uuid=True), ForeignKey("sermons.id", ondelete="CASCADE"), nullable=False)
    added_at = Column(TIMESTAMP, default=datetime.utcnow)
    
    __table_args__ = (
        {'sqlite_autoincrement': True},
    )
