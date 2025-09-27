from pydantic import BaseModel
from typing import Optional

class Task(BaseModel):
    id: str
    title: str
    due: Optional[str] = None
    completed: bool = False
