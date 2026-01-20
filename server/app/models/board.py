from pydantic import BaseModel, Field
from typing import List, Dict, Any
from datetime import datetime

class DrawingEvent(BaseModel):
    type: str 
    tool: str 
    data: Dict[str, Any]
    color: str
    stroke: int
    userId: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class Board(BaseModel):
    board_id: str
    owner_id: str = "anon"
    created_at: datetime = Field(default_factory=datetime.utcnow)
    snapshot: List[DrawingEvent] = []
