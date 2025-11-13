import os
import requests
from typing import Optional
import asyncio
from datetime import datetime
import httpx

class IcecastService:
    def __init__(self):
        self.icecast_host = os.getenv("ICECAST_HOST", "localhost")
        self.icecast_port = os.getenv("ICECAST_PORT", "8001")
        self.source_password = os.getenv("ICECAST_SOURCE_PASSWORD", "churchsource123")
        self.admin_user = os.getenv("ICECAST_ADMIN_USER", "admin")
        self.admin_password = os.getenv("ICECAST_ADMIN_PASSWORD", "churchadmin123")
        self.mount_point = "/live"
        self.active_streams = {}
        self.stream_connections = {}

    def get_stream_url(self) -> str:
        """Get public Icecast stream URL"""
        return f"http://{self.icecast_host}:{self.icecast_port}{self.mount_point}"

    def get_source_url(self) -> str:
        """Get Icecast source URL for streaming"""
        return f"http://source:{self.source_password}@{self.icecast_host}:{self.icecast_port}{self.mount_point}"

    async def get_listener_count(self) -> int:
        """Get current listener count from Icecast stats"""
        try:
            url = f"http://{self.icecast_host}:{self.icecast_port}/status-json.xsl"
            response = await asyncio.to_thread(
                requests.get,
                url,
                auth=(self.admin_user, self.admin_password),
                timeout=5
            )
            if response.status_code == 200:
                data = response.json()
                sources = data.get("icestats", {}).get("source", [])
                if isinstance(sources, dict):
                    sources = [sources]
                for source in sources:
                    if source.get("listenurl", "").endswith(self.mount_point):
                        return source.get("listeners", 0)
            return 0
        except Exception as e:
            print(f"Error getting listener count: {e}")
            return 0

    async def update_metadata(self, title: str, description: str = "") -> bool:
        """Update stream metadata"""
        try:
            url = f"http://{self.icecast_host}:{self.icecast_port}/admin/metadata"
            params = {
                "mount": self.mount_point,
                "mode": "updinfo",
                "song": title
            }
            response = await asyncio.to_thread(
                requests.get,
                url,
                params=params,
                auth=(self.admin_user, self.admin_password),
                timeout=5
            )
            return response.status_code == 200
        except Exception as e:
            print(f"Error updating metadata: {e}")
            return False

    async def check_connection(self) -> bool:
        """Check if Icecast server is reachable"""
        try:
            url = f"http://{self.icecast_host}:{self.icecast_port}/status.xsl"
            response = await asyncio.to_thread(
                requests.get,
                url,
                timeout=5
            )
            return response.status_code == 200
        except Exception:
            return False

    async def start_stream(self, stream_id: str):
        """Start persistent connection to Icecast"""
        if stream_id in self.stream_connections:
            return
        
        url = f"http://{self.icecast_host}:{self.icecast_port}{self.mount_point}"
        auth = ("source", self.source_password)
        
        client = httpx.AsyncClient(timeout=None)
        self.stream_connections[stream_id] = {
            "client": client,
            "url": url,
            "auth": auth,
            "request": None
        }

    async def send_audio_chunk(self, stream_id: str, audio_data: bytes):
        """Send audio chunk to Icecast"""
        if stream_id not in self.stream_connections:
            await self.start_stream(stream_id)
        
        conn = self.stream_connections[stream_id]
        try:
            await conn["client"].put(
                conn["url"],
                content=audio_data,
                auth=conn["auth"],
                headers={"Content-Type": "audio/mpeg"}
            )
        except Exception as e:
            print(f"Error sending audio chunk: {e}")

    async def stop_stream(self, stream_id: str):
        """Stop persistent connection"""
        if stream_id in self.stream_connections:
            conn = self.stream_connections[stream_id]
            await conn["client"].aclose()
            del self.stream_connections[stream_id]

icecast_service = IcecastService()
