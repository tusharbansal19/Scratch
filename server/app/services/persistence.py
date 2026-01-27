import asyncio
import json
from collections import defaultdict
from app.realtime.pipelines import persist_queue
from app.db.mongodb import mongodb

# Tunable parameters
BATCH_SIZE = 50          # max events per batch
FLUSH_INTERVAL = 0.5    # seconds

async def apply_events_to_board(board_id: str, events: list):
    """
    Apply a batch of events to one board snapshot in MongoDB.
    """

    mongo_events_to_push = []

    for msg in events:
        t = msg["type"]
        data = msg.get("data")

        # Add new object
        if t == "object:added":
            mongo_events_to_push.append(data)

        # Modify object (remove old, add new)
        elif t == "object:modified":
            obj_id = data.get("id")
            if obj_id:
                await mongodb.db.boards.update_one(
                    {"board_id": board_id},
                    {"$pull": {"snapshot": {"id": obj_id}}}
                )
                mongo_events_to_push.append(data)

        # Remove object
        elif t == "object:removed":
            obj_id = data.get("id")
            if obj_id:
                await mongodb.db.boards.update_one(
                    {"board_id": board_id},
                    {"$pull": {"snapshot": {"id": obj_id}}}
                )

        # Clear board
        elif t == "board:clear":
            await mongodb.db.boards.update_one(
                {"board_id": board_id},
                {"$set": {"snapshot": []}}
            )

    # Final batch push (one write for many objects)
    if mongo_events_to_push:
        await mongodb.db.boards.update_one(
            {"board_id": board_id},
            {"$push": {"snapshot": {"$each": mongo_events_to_push}}}
        )

async def flush_buffer(buffer):
    if not buffer:
        return

    # Group events by board_id
    grouped = defaultdict(list)
    for board_id, msg in buffer:
        grouped[board_id].append(msg)

    for board_id, events in grouped.items():
        try:
            await apply_events_to_board(board_id, events)
        except Exception as e:
            print(f"Mongo write failed for board {board_id}:", e)

async def mongo_persistence_worker():
    """
    Background worker that:
    - Reads events from persist_queue
    - Buffers them
    - Batches writes to MongoDB
    - Never blocks WebSocket hot path
    """

    buffer = []
    last_flush = asyncio.get_event_loop().time()

    print("Mongo persistence worker started")

    while True:
        try:
             # Wait for next item with timeout so we can flush if idle
            try:
                # Use wait_for to implement flush interval even if no new events comes in
                # Calculate time remaining until next flush
                now = asyncio.get_event_loop().time()
                time_since_last = now - last_flush
                timeout = max(0, FLUSH_INTERVAL - time_since_last)
                
                if timeout == 0 and buffer:
                     # Flush immediately
                     await flush_buffer(buffer)
                     buffer.clear()
                     last_flush = asyncio.get_event_loop().time()
                     # Reset timeout to full interval
                     timeout = FLUSH_INTERVAL
                
                if timeout == 0:
                     timeout = FLUSH_INTERVAL # Should not happen if logic is correct but safety


                item = await asyncio.wait_for(persist_queue.get(), timeout=timeout)
                
                board_id = item["board_id"]
                data_str = item["data"]

                try:
                    msg = json.loads(data_str)
                    msg_type = msg.get("type")

                    # Only persist stable events
                    if msg_type in [
                        "object:added",
                        "object:modified",
                        "object:removed",
                        "board:clear"
                    ]:
                        buffer.append((board_id, msg))

                except Exception as e:
                    print("Bad persistence message:", e)

            except asyncio.TimeoutError:
                # Timeout reached, time to flush if we have anything
                pass
            
            now = asyncio.get_event_loop().time()

            # Flush conditions
            if len(buffer) >= BATCH_SIZE or (now - last_flush) >= FLUSH_INTERVAL:
                await flush_buffer(buffer)
                buffer.clear()
                last_flush = now
                
        except asyncio.CancelledError:
            # Handle shutdown gracefulness if needed
            if buffer:
                await flush_buffer(buffer)
            raise
        except Exception as e:
             print(f"Worker loop error: {e}")
             await asyncio.sleep(1) # Prevent tight loop on error
