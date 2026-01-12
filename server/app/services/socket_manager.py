from typing import Dict, List
from fastapi import WebSocket
import logging

class ConnectionManager:
    def __init__(self):
        # board_id -> List[WebSocket]
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, board_id: str):
        await websocket.accept()
        if board_id not in self.active_connections:
            self.active_connections[board_id] = []
        self.active_connections[board_id].append(websocket)
        logging.info(f"Client connected to board {board_id}")

    def disconnect(self, websocket: WebSocket, board_id: str):
        if board_id in self.active_connections:
            if websocket in self.active_connections[board_id]:
                self.active_connections[board_id].remove(websocket)
            if not self.active_connections[board_id]:
                del self.active_connections[board_id]
        logging.info(f"Client disconnected from board {board_id}")

    async def broadcast_to_local(self, board_id: str, message: str):
        """
        Broadcasts a message to all locally connected websockets for a board.
        """
        if board_id in self.active_connections:
            # Iterate over a copy to avoid modification issues during iteration if disconnect happens
            for connection in self.active_connections[board_id]:
                try:
                    await connection.send_text(message)
                except Exception as e:
                    logging.error(f"Error broadcasting: {e}")

manager = ConnectionManager()
