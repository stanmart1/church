import os
import requests
import asyncio
import xml.etree.ElementTree as ET

class IcecastService:
    def __init__(self):
        self.icecast_host = os.getenv("ICECAST_HOST", "localhost")
        self.icecast_port = os.getenv("ICECAST_PORT", "8001")
        self.source_password = os.getenv("ICECAST_SOURCE_PASSWORD", "churchsource123")
        self.admin_user = os.getenv("ICECAST_ADMIN_USER", "admin")
        self.admin_password = os.getenv("ICECAST_ADMIN_PASSWORD", "churchadmin123")
        self.mount_point = "/live"

    def get_stream_url(self) -> str:
        """Get public Icecast stream URL"""
        return f"http://{self.icecast_host}:{self.icecast_port}{self.mount_point}"

    def get_butt_config(self) -> dict:
        """Get Butt connection configuration"""
        return {
            "server": self.icecast_host,
            "port": self.icecast_port,
            "password": self.source_password,
            "mount": self.mount_point,
            "stream_url": self.get_stream_url()
        }

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

    async def is_source_connected(self) -> bool:
        """Check if a source is connected to the mount point"""
        try:
            url = f"http://{self.icecast_host}:{self.icecast_port}/admin/stats.xml"
            response = await asyncio.to_thread(
                requests.get,
                url,
                auth=(self.admin_user, self.admin_password),
                timeout=5
            )
            if response.status_code == 200:
                root = ET.fromstring(response.text)
                for source in root.findall(".//source"):
                    mount = source.get("mount")
                    if mount == self.mount_point:
                        return True
            return False
        except Exception as e:
            print(f"Error checking source: {e}")
            return False

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

icecast_service = IcecastService()
