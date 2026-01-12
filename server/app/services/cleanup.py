
import asyncio
import time
import logging
from app.services.socket_manager import manager
from app.db.mongodb import mongodb

async def cleanup_empty_rooms():
    """
    Periodically checks for rooms that have been empty for more than 5 minutes
    and deletes them if they have no content (snapshot is empty).
    """
    while True:
        try:
            await asyncio.sleep(60) # Check every minute
            
            now = time.time()
            # Create list copy to modify dict safely
            empty_rooms = list(manager.empty_since.items())
            
            for board_id, timestamp in empty_rooms:
                if now - timestamp > 300: # 5 minutes
                    # Check if actually empty in DB
                    board = await mongodb.db.boards.find_one({"board_id": board_id})
                    
                    if not board:
                        # Already gone, just clean up memory
                        if board_id in manager.empty_since:
                            del manager.empty_since[board_id]
                        continue
                    
                    # Logic: "Room is black" -> Empty snapshot
                    snapshot = board.get("snapshot", [])
                    if not snapshot or len(snapshot) == 0:
                        logging.info(f"Removing inactive empty room: {board_id}")
                        await mongodb.db.boards.delete_one({"board_id": board_id})
                    
                    # Either way, if it's been empty for 5 minutes, we stop tracking it 
                    # (if we didn't delete it, it stays in DB but we don't need to check repeatedly until someone joins/leaves again? 
                    # Actually if we don't delete it, we should probably keep checking or just ignore? 
                    # If we don't delete, it remains "empty_since" X. better to leave it in the dict so we check again? 
                    # No, if we decided NOT to delete it now (because it has content), we probably won't delete it later unless policy changes. 
                    # But the requirement is "room is black" -> closed. If not black, don't close.
                    
                    # To remain efficient, let's remove from dict. If someone joins/leaves, it re-triggers.
                    if board_id in manager.empty_since:
                        del manager.empty_since[board_id]

        except Exception as e:
            logging.error(f"Error in cleanup task: {e}")
