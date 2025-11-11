import os

class IcecastService:
    def get_stream_url(self) -> str:
        """Get Icecast stream URL from environment"""
        return os.getenv("ICECAST_STREAM_URL", "")

icecast_service = IcecastService()
