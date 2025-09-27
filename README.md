# Agentic Routine (Hackathon Monorepo)

FastAPI backend + plain React (Vite-style) frontend. Minimal DB by default (SQLite via SQLAlchemy is wired but optional).
Gemini is the default LLM provider (replace `GEMINI_API_KEY` in `.env`).

## Quickstart

### Backend
```bash
cd backend
python -m venv .venv && source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp ../.env.example .env  # and fill values
uvicorn app.main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Environment
Copy `.env.example` to `.env` at repo root (used by both backend & frontend during local dev).

## First Feature Flow: Agent ↔ Calendar Onboarding
1) User authenticates with Google (OAuth2) and connects Calendar.
2) Backend imports upcoming events; stores only minimal metadata locally.
3) Agent asks for routines (e.g., "Gym 3x/week, wake at 7am weekdays").
4) Agent parses routines → proposes calendar changes → user confirms → events created.
5) Day-of, Taskmaster reminds user; user reports completion → XP/Money awarded.

## Folders
- `backend/`: FastAPI server, services for Calendar/Gamification/Agent (Gemini), optional SQLite via SQLAlchemy.
- `frontend/`: React app with minimal routing and an Agent chat pane, Calendar view stub, and Shop stub.
- `docs/`: Architecture, API spec, roadmap.
