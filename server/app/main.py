from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import asyncio

from app.api.endpoints import router as api_router
from app.api.auth import router as auth_router
from app.core.config import settings
from app.db.mongodb import mongodb
from app.db.redis import redis_client
from app.services.redis_listener import listen_to_redis

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    mongodb.connect()
    await redis_client.connect()
    
    # Start Redis Listener and Cleanup in background
    from app.services.cleanup import cleanup_empty_rooms
    task = asyncio.create_task(listen_to_redis())
    cleanup_task = asyncio.create_task(cleanup_empty_rooms())
    
    yield
    
    # Shutdown
    task.cancel()
    cleanup_task.cancel()
    try:
        await task
        await cleanup_task
    except asyncio.CancelledError:
        pass
        
    mongodb.close()
    await redis_client.close()

app = FastAPI(title="Collaborative Board API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api")
app.include_router(auth_router, prefix="/api/auth", tags=["auth"])

@app.get("/")
def read_root():
    return {"status": "ok", "service": "collaborative-drawing-board"}

# Force reload for email-validator installation
