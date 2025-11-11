from fastapi import WebSocket
from typing import Dict, Set
import json
import asyncio
from datetime import datetime, timedelta

class ConnectionManager:
    def __init__(self):
        self.stream_subscriptions: Dict[str, Set[WebSocket]] = {}
        self.stream_status_subscribers: Set[WebSocket] = set()
        self.notification_subscribers: Dict[str, Set[WebSocket]] = {}
        self.max_connections_per_stream = 1000
        self.connection_timeout = timedelta(minutes=5)
        self.last_activity: Dict[WebSocket, datetime] = {}
        
    async def connect_stream(self, websocket: WebSocket, stream_id: str):
        if stream_id not in self.stream_subscriptions:
            self.stream_subscriptions[stream_id] = set()
        
        if len(self.stream_subscriptions[stream_id]) >= self.max_connections_per_stream:
            await websocket.send_json({"type": "error", "message": "Stream capacity reached"})
            return False
            
        self.stream_subscriptions[stream_id].add(websocket)
        self.last_activity[websocket] = datetime.utcnow()
        return True
    
    def disconnect_stream(self, websocket: WebSocket, stream_id: str):
        if stream_id in self.stream_subscriptions:
            self.stream_subscriptions[stream_id].discard(websocket)
            if not self.stream_subscriptions[stream_id]:
                del self.stream_subscriptions[stream_id]
        self.last_activity.pop(websocket, None)
    
    def connect_stream_status(self, websocket: WebSocket):
        self.stream_status_subscribers.add(websocket)
        self.last_activity[websocket] = datetime.utcnow()
    
    def disconnect_stream_status(self, websocket: WebSocket):
        self.stream_status_subscribers.discard(websocket)
        self.last_activity.pop(websocket, None)
    
    def connect_notifications(self, websocket: WebSocket, user_id: str):
        if user_id not in self.notification_subscribers:
            self.notification_subscribers[user_id] = set()
        self.notification_subscribers[user_id].add(websocket)
        self.last_activity[websocket] = datetime.utcnow()
    
    def disconnect_notifications(self, websocket: WebSocket, user_id: str):
        if user_id in self.notification_subscribers:
            self.notification_subscribers[user_id].discard(websocket)
            if not self.notification_subscribers[user_id]:
                del self.notification_subscribers[user_id]
        self.last_activity.pop(websocket, None)
    
    async def broadcast_to_stream(self, stream_id: str, message: dict):
        if stream_id in self.stream_subscriptions:
            disconnected = set()
            for websocket in self.stream_subscriptions[stream_id]:
                try:
                    await websocket.send_json(message)
                except:
                    disconnected.add(websocket)
            
            for ws in disconnected:
                self.stream_subscriptions[stream_id].discard(ws)
    
    async def broadcast_stream_status(self, message: dict):
        disconnected = set()
        for websocket in self.stream_status_subscribers:
            try:
                await websocket.send_json(message)
            except:
                disconnected.add(websocket)
        
        for ws in disconnected:
            self.stream_status_subscribers.discard(ws)
    
    async def send_notification(self, user_id: str, message: dict):
        if user_id in self.notification_subscribers:
            disconnected = set()
            for websocket in self.notification_subscribers[user_id]:
                try:
                    await websocket.send_json(message)
                except:
                    disconnected.add(websocket)
            
            for ws in disconnected:
                self.notification_subscribers[user_id].discard(ws)
    
    async def broadcast_notifications(self, message: dict):
        for user_id in list(self.notification_subscribers.keys()):
            await self.send_notification(user_id, message)
    
    def update_activity(self, websocket: WebSocket):
        self.last_activity[websocket] = datetime.utcnow()
    
    async def cleanup_stale_connections(self):
        now = datetime.utcnow()
        stale = [ws for ws, last in self.last_activity.items() 
                 if now - last > self.connection_timeout]
        
        for ws in stale:
            for stream_id, clients in list(self.stream_subscriptions.items()):
                if ws in clients:
                    clients.discard(ws)
                    if not clients:
                        del self.stream_subscriptions[stream_id]
            
            self.stream_status_subscribers.discard(ws)
            
            for user_id, clients in list(self.notification_subscribers.items()):
                if ws in clients:
                    clients.discard(ws)
                    if not clients:
                        del self.notification_subscribers[user_id]
            
            self.last_activity.pop(ws, None)
            try:
                await ws.close()
            except:
                pass

manager = ConnectionManager()
