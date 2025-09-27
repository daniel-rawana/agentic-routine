from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routes import auth, tasks, agent

app = FastAPI(title="Agentic Routine API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten in prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(tasks.router, prefix="/api/tasks", tags=["tasks"])
app.include_router(agent.router, prefix="/api/agent", tags=["agent"])

@app.get("/api/health")
async def health():
    return {"status": "ok"}
