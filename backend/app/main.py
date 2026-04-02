"""
RSVP System – FastAPI Backend
"""
from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from typing import List
import json

from app.config import settings
from app.database import init_db, get_db, AsyncSessionLocal
from app.models import AdminUser
from app.auth import hash_password
from app.routers import auth, rsvp, whatsapp
from sqlalchemy import select


# ─── Rate limiter ─────────────────────────────────────────────────────────────

limiter = Limiter(key_func=get_remote_address, default_limits=["200/minute"])


# ─── WebSocket connection manager ─────────────────────────────────────────────

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, ws: WebSocket):
        await ws.accept()
        self.active_connections.append(ws)

    def disconnect(self, ws: WebSocket):
        if ws in self.active_connections:
            self.active_connections.remove(ws)

    async def broadcast(self, data: dict):
        message = json.dumps(data)
        dead = []
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except Exception:
                dead.append(connection)
        for ws in dead:
            self.disconnect(ws)


manager = ConnectionManager()


# ─── Startup / Shutdown ────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Init DB tables
    await init_db()

    # Create default admin if not exists
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(AdminUser).where(AdminUser.email == settings.ADMIN_EMAIL))
        if not result.scalar_one_or_none():
            admin = AdminUser(
                email=settings.ADMIN_EMAIL,
                hashed_password=hash_password(settings.ADMIN_PASSWORD),
            )
            db.add(admin)
            await db.commit()
            print(f"✅ Default admin created: {settings.ADMIN_EMAIL}")

    print("🚀 RSVP System started")
    yield
    print("👋 RSVP System shutting down")


# ─── App ──────────────────────────────────────────────────────────────────────

app = FastAPI(
    title="RSVP System API",
    description="Production-ready RSVP management system",
    version="1.0.0",
    lifespan=lifespan,
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.get_cors_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Routers ──────────────────────────────────────────────────────────────────

app.include_router(auth.router)
app.include_router(rsvp.router)
app.include_router(whatsapp.router)


# ─── WebSocket: real-time dashboard updates ───────────────────────────────────

@app.websocket("/ws/dashboard")
async def ws_dashboard(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()  # Keep alive / ping
    except WebSocketDisconnect:
        manager.disconnect(websocket)


# Expose manager globally so routers can broadcast
app.state.ws_manager = manager


# ─── Health check ─────────────────────────────────────────────────────────────

@app.get("/health", tags=["meta"])
async def health():
    return {"status": "ok", "service": "rsvp-api"}


@app.get("/", tags=["meta"])
async def root():
    return {
        "service": "RSVP System API",
        "version": "1.0.0",
        "docs": "/docs",
    }
