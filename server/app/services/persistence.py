import asyncio
import json
from collections import defaultdict
from app.realtime.pipelines import persist_queue
from app.db.mongodb import mongodb
from pymongo import UpdateOne

# Tunable parameters
BATCH_SIZE = 50          # max events per batch
FLUSH_INTERVAL = 0.5    # seconds

async def apply_events_to_board(board_id: str, events: list):
    """
    Apply a batch of events to one board snapshot in MongoDB.
    """

    bulk_ops = []

    for msg in events:
        t = msg["type"]
        data = msg.get("data")

        # Add new object
        if t == "object:added":
            bulk_ops.append(UpdateOne(
                {"board_id": board_id},
                {"$push": {"snapshot": data}}
            ))

        # Modify object (remove old, add new approach for Upsert behavior)
        # Using $pull then $push in bulk is guaranteed order.
        elif t == "object:modified":
            obj_id = data.get("id")
            if obj_id:
                bulk_ops.append(UpdateOne(
                    {"board_id": board_id},
                    {"$pull": {"snapshot": {"id": obj_id}}}
                ))
                bulk_ops.append(UpdateOne(
                    {"board_id": board_id},
                    {"$push": {"snapshot": data}}
                ))

        # Remove object
        elif t == "object:removed":
            obj_id = data.get("id")
            if obj_id:
                bulk_ops.append(UpdateOne(
                    {"board_id": board_id},
                    {"$pull": {"snapshot": {"id": obj_id}}}
                ))

        # Clear board
        elif t == "board:clear":
            bulk_ops.append(UpdateOne(
                {"board_id": board_id},
                {"$set": {"snapshot": []}}
            ))

    # Execute bulk write
    if bulk_ops:
        try:
            await mongodb.db.boards.bulk_write(bulk_ops, ordered=True)
        except Exception as e:
             # If bulk write fails, we should log it. 
             # In a real app, strict error handling might be needed, 
             # but keeping the worker alive is priority.
             print(f"Bulk write failed for board {board_id}: {e}")

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
