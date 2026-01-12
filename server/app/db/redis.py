import redis.asyncio as redis
from app.core.config import settings
import asyncio
import logging
import fnmatch

class MockPubSub:
    def __init__(self, mock_redis):
        self.mock_redis = mock_redis
        self.queue = asyncio.Queue()
        self.subscribed_patterns = []

    async def psubscribe(self, pattern):
        self.subscribed_patterns.append(pattern)
        # Register this pubsub to the mock redis
        self.mock_redis.add_subscriber(self)
        logging.info(f"MockPubSub subscribed to {pattern}")

    async def listen(self):
        while True:
            message = await self.queue.get()
            yield message

    async def unsubscribe(self):
        self.mock_redis.remove_subscriber(self)


class MockRedis:
    def __init__(self):
        self.subscribers = []

    def add_subscriber(self, pubsub):
        self.subscribers.append(pubsub)

    def remove_subscriber(self, pubsub):
        if pubsub in self.subscribers:
            self.subscribers.remove(pubsub)

    async def publish(self, channel, message):
        # Broadcast to all subscribers that match the channel
        # For our app, we use psubscribe "board:*"
        # We simulate the Redis message format: {'type': 'pmessage', 'channel': ..., 'data': ...}
        
        for sub in self.subscribers:
            for pattern in sub.subscribed_patterns:
                # Simple glob matching
                if fnmatch.fnmatch(channel, pattern):
                    formatted_msg = {
                        "type": "pmessage",
                        "pattern": pattern,
                        "channel": channel,
                        "data": message
                    }
                    await sub.queue.put(formatted_msg)
        return len(self.subscribers)

    def pubsub(self):
        return MockPubSub(self)

    async def close(self):
        pass


class RedisClient:
    redis = None

    async def connect(self):
        try:
            # Try connecting to real Redis
            client = redis.from_url(settings.REDIS_URL, encoding="utf-8", decode_responses=True)
            await client.ping()
            self.redis = client
            logging.info("Connected to real Redis")
        except Exception as e:
            logging.warning(f"Could not connect to Redis: {e}. Switching to MockRedis (In-Memory).")
            self.redis = MockRedis()

    async def close(self):
        if self.redis:
            await self.redis.close()
            logging.info("Closed Redis connection")

redis_client = RedisClient()
