from fastapi import APIRouter, WebSocket, WebSocketDisconnect, HTTPException
from app.services.socket_manager import manager
from app.db.redis import redis_client
from app.db.mongodb import mongodb
from app.models.board import Board
from app.realtime.pipelines import persist_queue
import uuid
import json

router = APIRouter()

@router.post("/boards", response_model=Board)
async def create_board():
    board_id = str(uuid.uuid4())[:8] # Short hash-like for friendly URL
    new_board = Board(board_id=board_id, owner_id="anon")
    
    # Save to Mongo
    await mongodb.db.boards.insert_one(new_board.model_dump())
    return new_board

@router.get("/boards/{board_id}", response_model=Board)
async def get_board(board_id: str):
    board = await mongodb.db.boards.find_one({"board_id": board_id})
    if not board:
        raise HTTPException(status_code=404, detail="Board not found")
    return board

@router.websocket("/ws/{board_id}")
async def websocket_endpoint(websocket: WebSocket, board_id: str):
    await manager.connect(websocket, board_id)
    
    # Send initial history from MongoDB
    try:
        board = await mongodb.db.boards.find_one({"board_id": board_id})
        if board and "snapshot" in board:
            snapshot = board["snapshot"]
            dirty = False
            
            # Migration: Ensure all objects have IDs
            for item in snapshot:
                if not item.get("id"):
                    item["id"] = str(uuid.uuid4())
                    dirty = True
            
            if dirty:
                await mongodb.db.boards.update_one(
                    {"board_id": board_id},
                    {"$set": {"snapshot": snapshot}}
                )
            
            # Send history as a batch
            history_msg = {
                "type": "history",
                "data": snapshot
            }
            await websocket.send_text(json.dumps(history_msg))
    except Exception as e:
        print(f"Error fetching/migrating history: {e}")

    try:
        while True:
            data_str = await websocket.receive_text()
            
            # Publish to Redis immediately for low latency (others see it fast)
            if redis_client.redis:
                await redis_client.redis.publish(f"board:{board_id}", data_str)

            # Async persistence (Fire and forget style for performance, or simple await)
            # In a real heavy app, this would go to a background worker queue (Celery/IQ)
            # Async persistence (Fire and forget style for performance, or simple await)
            # In a real heavy app, this would go to a background worker queue (Celery/IQ)
            try:
                await persist_queue.put({
                    "board_id": board_id,
                    "data": data_str
                })
            except Exception as e:
                print(f"Error queueing persistence events: {e}")
            
    except WebSocketDisconnect:
        manager.disconnect(websocket, board_id)
