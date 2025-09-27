from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from routes import api

app = FastAPI(title="LifeQuest Backend")

# Enable CORS so frontend (React dev server) can call backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve React build (when you run `npm run build` in frontend/)
# The build output should be copied or symlinked into backend/static/
app.mount("/static", StaticFiles(directory="static"), name="static")

# API routes
app.include_router(api.router, prefix="/api")

@app.get("/health")
def health_check():
    return {"status": "ok"}


# --- Frontend catch-all ---
# This serves index.html so React Router can handle client-side routing
@app.get("/{full_path:path}")
async def serve_frontend(full_path: str):
    return FileResponse("static/index.html")
