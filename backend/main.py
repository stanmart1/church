from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import asyncio
from app.core.config import settings
from app.core.database import engine, AsyncSessionLocal
from app.middleware.security import SecurityHeadersMiddleware
from app.routes import (
    auth, sermons, events, members, livestreams, prayers,
    announcements, giving, dashboard, content, settings as settings_route,
    forms, playlists, health, websocket, users, profile, permissions, roles, series
)
from app.websocket.handlers import heartbeat_task, cleanup_task, stats_broadcast_task
from app.services.token_blacklist_service import cleanup_expired_tokens

async def token_cleanup_task():
    while True:
        async with AsyncSessionLocal() as db:
            try:
                await cleanup_expired_tokens(db)
            except Exception as e:
                print(f"Token cleanup error: {e}")
        await asyncio.sleep(6 * 60 * 60)  # Every 6 hours

async def stats_task():
    while True:
        try:
            async with AsyncSessionLocal() as db:
                await stats_broadcast_task(db)
        except Exception as e:
            print(f"Stats broadcast error: {e}")
        await asyncio.sleep(2)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    asyncio.create_task(token_cleanup_task())
    asyncio.create_task(heartbeat_task())
    asyncio.create_task(cleanup_task())
    asyncio.create_task(stats_task())
    print("Server starting...")
    print("WebSocket server ready")
    yield
    # Shutdown
    await engine.dispose()
    print("Graceful shutdown completed")

app = FastAPI(
    title="Church Management API",
    description="A modern church administration platform with member management, sermons, events, livestreaming, and more.",
    version="1.0.0",
    lifespan=lifespan,
    swagger_ui_parameters={"defaultModelsExpandDepth": -1}
)

app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL] if settings.FRONTEND_URL else ["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Content-Type", "Authorization"]
)

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

@app.get("/")
async def root():
    return {"status": "ok", "message": "Church API is running"}

app.include_router(health.router)
app.include_router(auth.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")
app.include_router(members.router, prefix="/api")
app.include_router(sermons.router, prefix="/api")
app.include_router(events.router, prefix="/api")
app.include_router(announcements.router, prefix="/api")
app.include_router(forms.router, prefix="/api")
app.include_router(playlists.router, prefix="/api")
app.include_router(livestreams.router, prefix="/api")
app.include_router(giving.router, prefix="/api")
app.include_router(prayers.router, prefix="/api")
app.include_router(content.router, prefix="/api")
app.include_router(settings_route.router, prefix="/api")
app.include_router(users.router, prefix="/api")
app.include_router(profile.router, prefix="/api")
app.include_router(permissions.router, prefix="/api")
app.include_router(roles.router, prefix="/api")
app.include_router(series.router, prefix="/api")
app.include_router(websocket.router)
