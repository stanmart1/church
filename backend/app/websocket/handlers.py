from fastapi import WebSocket, WebSocketDisconnect
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.websocket.manager import manager
from app.models.livestream import Livestream, ChatMessage
from app.models.stream import StreamViewer
import json
import asyncio

async def get_stream_stats(db: AsyncSession, stream_id: str):
    result = await db.execute(
        select(
            Livestream.is_live,
            func.coalesce(func.count(StreamViewer.id).filter(StreamViewer.status == 'active'), 0).label('current_viewers'),
            func.coalesce(Livestream.viewers, 0).label('peak_viewers'),
            func.coalesce(func.count(ChatMessage.id), 0).label('chat_messages'),
            func.case(
                (Livestream.is_live & (Livestream.start_time.isnot(None)),
                 func.extract('epoch', func.now() - Livestream.start_time).cast(int)),
                else_=0
            ).label('duration')
        )
        .outerjoin(StreamViewer, StreamViewer.livestream_id == Livestream.id)
        .outerjoin(ChatMessage, ChatMessage.livestream_id == Livestream.id)
        .where(Livestream.id == stream_id)
        .group_by(Livestream.id)
    )
    row = result.first()
    
    if not row or not row.is_live:
        return None
    
    return {
        "current_viewers": int(row.current_viewers),
        "peak_viewers": int(row.peak_viewers),
        "duration": row.duration,
        "chat_messages": int(row.chat_messages),
        "is_live": row.is_live
    }

async def handle_websocket(websocket: WebSocket, db: AsyncSession):
    await websocket.accept()
    stream_id = None
    user_id = None
    
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            manager.update_activity(websocket)
            
            if message["type"] == "ping":
                await websocket.send_json({"type": "pong"})
            
            elif message["type"] == "subscribe-stream-status":
                manager.connect_stream_status(websocket)
            
            elif message["type"] == "subscribe" and message.get("streamId"):
                stream_id = message["streamId"]
                connected = await manager.connect_stream(websocket, stream_id)
                if connected:
                    stats = await get_stream_stats(db, stream_id)
                    if stats:
                        await websocket.send_json({"type": "stats", "stats": stats})
            
            elif message["type"] == "chat-message" and message.get("streamId"):
                chat_msg = ChatMessage(
                    livestream_id=message["streamId"],
                    user_id=message.get("userId"),
                    user_name=message["userName"],
                    text=message["text"]
                )
                db.add(chat_msg)
                await db.commit()
                await db.refresh(chat_msg)
                
                await manager.broadcast_to_stream(
                    message["streamId"],
                    {"type": "new-message", "message": {
                        "id": str(chat_msg.id),
                        "livestream_id": str(chat_msg.livestream_id),
                        "user_id": str(chat_msg.user_id) if chat_msg.user_id else None,
                        "user_name": chat_msg.user_name,
                        "text": chat_msg.text,
                        "created_at": chat_msg.created_at.isoformat()
                    }}
                )
            
            elif message["type"] == "subscribe-notifications" and message.get("userId"):
                user_id = message["userId"]
                manager.connect_notifications(websocket, user_id)
    
    except WebSocketDisconnect:
        pass
    finally:
        if stream_id:
            manager.disconnect_stream(websocket, stream_id)
        manager.disconnect_stream_status(websocket)
        if user_id:
            manager.disconnect_notifications(websocket, user_id)

async def broadcast_stream_status_change():
    await manager.broadcast_stream_status({"type": "stream-status-change"})

async def broadcast_stream_update():
    await manager.broadcast_stream_status({"type": "stream-update"})

async def broadcast_viewers_update():
    await manager.broadcast_stream_status({"type": "viewers-update"})

async def broadcast_viewer_kicked(user_id: str):
    await manager.broadcast_stream_status({"type": "viewer-kicked", "userId": user_id})

async def broadcast_notification(user_id: str):
    await manager.send_notification(user_id, {"type": "new-notification"})

async def broadcast_to_all_users():
    await manager.broadcast_notifications({"type": "new-notification"})

async def stats_broadcast_task(db: AsyncSession):
    while True:
        await asyncio.sleep(3)
        for stream_id in list(manager.stream_subscriptions.keys()):
            stats = await get_stream_stats(db, stream_id)
            if stats:
                await manager.broadcast_to_stream(stream_id, {"type": "stats", "stats": stats})

async def heartbeat_task():
    while True:
        await asyncio.sleep(30)
        all_websockets = set()
        for clients in manager.stream_subscriptions.values():
            all_websockets.update(clients)
        all_websockets.update(manager.stream_status_subscribers)
        for clients in manager.notification_subscribers.values():
            all_websockets.update(clients)
        
        for ws in all_websockets:
            try:
                await ws.send_json({"type": "ping"})
            except:
                pass

async def cleanup_task():
    while True:
        await asyncio.sleep(60)
        await manager.cleanup_stale_connections()
