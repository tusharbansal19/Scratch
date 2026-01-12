import asyncio
import logging
from app.db.redis import redis_client
from app.services.socket_manager import manager

async def listen_to_redis():
    """
    Subscribes to all board channels and broadcasts messages to local connections.
    """
    if not redis_client.redis:
        logging.warning("Redis client not initialized, skipping listener")
        return

    pubsub = redis_client.redis.pubsub()
    await pubsub.psubscribe("board:*")
    logging.info("Subscribed to Redis board:* channels")
    
    try:
        async for message in pubsub.listen():
            if message["type"] == "pmessage":
                channel = message["channel"]
                # Channel format: board:{board_id}
                if ":" in channel:
                    board_id = channel.split(":")[1]
                    data = message["data"]
                    await manager.broadcast_to_local(board_id, data)
    except Exception as e:
        logging.error(f"Redis listener error: {e}")
