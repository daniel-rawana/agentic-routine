from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import asyncio

from agents.root_agent import root_agent
from google.genai import types
from google.adk.sessions import InMemorySessionService
from google.adk.runners import Runner

# ----- FastAPI app -----
app = FastAPI(title="Agent Query API")

# ----- Define request model -----
class QueryRequest(BaseModel):
    user_id: str
    session_id: str
    query: str

# ----- Global session and runner -----
session_service = None
runner = None

# ----- Async setup function -----
async def setup_agent():
    global session_service, runner
    if session_service is None:
        session_service = InMemorySessionService()
    if runner is None:
        runner = Runner(agent=root_agent, app_name="weather_tutorial_app", session_service=session_service)
    return runner

# ----- Helper to call agent asynchronously -----
async def call_agent_async(query: str, user_id: str, session_id: str):
    runner = await setup_agent()

    content = types.Content(role='user', parts=[types.Part(text=query)])
    final_response_text = "Agent did not produce a final response."

    async for event in runner.run_async(user_id=user_id, session_id=session_id, new_message=content):
        if event.is_final_response():
            if event.content and event.content.parts:
                final_response_text = event.content.parts[0].text
            elif event.actions and event.actions.escalate:
                final_response_text = f"Agent escalated: {event.error_message or 'No specific message.'}"
            break

    return final_response_text

# ----- API endpoint -----
@app.post("/query")
async def query_agent(request: QueryRequest):
    try:
        # Ensure session_service is initialized
        global session_service
        if session_service is None:
            session_service = InMemorySessionService()

        # Ensure session exists
        if not session_service.session_exists(request.user_id, request.session_id):
            session_service.create_session(request.user_id, request.session_id)

        # Call the agent
        response_text = await call_agent_async(
            query=request.query,
            user_id=request.user_id,
            session_id=request.session_id
        )
        return {"response": response_text}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))