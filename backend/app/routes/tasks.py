from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter()

class Task(BaseModel):
    id: str
    title: str
    due: Optional[str] = None
    completed: bool = False

# In-memory store for hackathon speed; swap for DB as needed
TASKS: dict[str, Task] = {}

@router.get("/", response_model=List[Task])
async def list_tasks():
    return list(TASKS.values())

@router.post("/", response_model=Task)
async def create_task(task: Task):
    TASKS[task.id] = task
    return task

@router.post("/complete/{task_id}")
async def complete_task(task_id: str):
    if task_id in TASKS:
        t = TASKS[task_id]
        TASKS[task_id] = Task(**{**t.model_dump(), "completed": True})
        return {"ok": True}
    return {"ok": False}
