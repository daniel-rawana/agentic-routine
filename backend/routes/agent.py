from fastapi import APIRouter
from pydantic import BaseModel
from ..services.agent_service import AgentService
from ..services.calendar_service import CalendarService

router = APIRouter()
agent_service = AgentService()
calendar_service = CalendarService()

class AgentMessage(BaseModel):
    user_id: str
    message: str

@router.post("/chat")
async def chat(msg: AgentMessage):
    # Minimal first feature: interpret routines and propose calendar plan
    response = await agent_service.handle_message(msg.user_id, msg.message)
    return {"reply": response}

@router.post("/bootstrap/{user_id}")
async def bootstrap_calendar(user_id: str):
    # Pull initial events; propose routine setup
    events = await calendar_service.list_upcoming_events(user_id)
    prompt = agent_service.build_routine_prompt(events)
    reply = await agent_service.generate(prompt)
    return {"events": events, "proposal": reply}
