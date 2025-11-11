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
