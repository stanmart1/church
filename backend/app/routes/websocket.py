from fastapi import APIRouter, WebSocket, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.websocket.handlers import handle_websocket
from app.core.database import AsyncSessionLocal

router = APIRouter()

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    async with AsyncSessionLocal() as db:
        await handle_websocket(websocket, db)

@router.websocket("/")
async def websocket_root(websocket: WebSocket):
    async with AsyncSessionLocal() as db:
        await handle_websocket(websocket, db)

@router.websocket("/ws/audio/{stream_id}")
async def audio_stream_endpoint(websocket: WebSocket, stream_id: str):
    from app.services.icecast_service import icecast_service
    await websocket.accept()
    
    try:
        while True:
            audio_data = await websocket.receive_bytes()
            await icecast_service.send_audio_chunk(stream_id, audio_data)
    except Exception as e:
        print(f"Audio stream error: {e}")
    finally:
        await icecast_service.stop_stream(stream_id)
