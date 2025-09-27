# 🧬 LifeQuest

> Gamify your real life and build better habits with an AI taskmaster that syncs to your calendar.

---

## 🚀 Overview

**LifeQuest** is an agentic AI web app that helps students (and anyone building routines) stay motivated and consistent by turning their real-world habits into a game. Connect your Google Calendar, talk to your AI “taskmaster” in natural language, and watch as your daily life transforms into a quest for XP, gold, and personal growth.

Whether it's waking up early, going to the gym, finishing assignments, or taking care of yourself — LifeQuest rewards you for showing up and sticking to your plan.

---

## ✨ Core Features

- 🧠 **AI Taskmaster Agent** – Chat with an intelligent assistant that helps you design, schedule, and track your routines.
- 📅 **Google Calendar Integration** – Import your events, plan new routines, and get reminders directly synced to your calendar.
- 🏆 **Gamified Progress System** – Earn XP and in-game currency for completing real-world tasks and build streaks to level up.
- 🏗️ **Custom Routines Onboarding** – At signup, the agent helps you commit to specific habits (e.g., “Wake up at 7:00” or “Gym 3x a week”) and automatically adds them to your schedule.
- 🏪 **Shop & Upgrades (Coming Soon)** – Spend earned gold on avatar upgrades, room customizations, and other cosmetic rewards.

---

## 🧱 Architecture

```
React (Vite) ──axios──► FastAPI ──► Services
                             ├─ CalendarService (Google Calendar API)
                             ├─ AgentService (Gemini LLM)
                             └─ Gamification (XP/Money rules)
```

- **Frontend:** React (Vite) SPA for UI  
- **Backend:** FastAPI server with modular services  
- **LLM Agent:** Google Gemini API for natural language understanding and planning  
- **Calendar Integration:** Google Calendar API (OAuth2)  
- **Database:** Optional SQLite (SQLAlchemy async) – can be replaced with Supabase or Postgres

---

## 🧪 Quickstart (Local Dev)

### 1. Clone & Install

```bash
git clone https://github.com/<your-username>/lifequest.git
cd lifequest
```

---

### 2. Backend Setup (FastAPI)

```bash
cd backend
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp ../.env.example .env     # Fill in GEMINI_API_KEY and Google OAuth credentials
uvicorn app.main:app --reload
```

Backend runs at: `http://localhost:8000`

---

### 3. Frontend Setup (React + Vite)

```bash
cd ../frontend
npm install
npm run dev
```

Frontend runs at: `http://localhost:5173`

---

## 🔑 Environment Variables

Copy `.env.example` to `.env` and fill in your credentials:

```bash
GEMINI_API_KEY=your_gemini_api_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:8000/api/auth/google/callback
```

---

## 🧭 Roadmap

- [x] Basic FastAPI + React scaffold  
- [x] Agent chat MVP (Gemini)  
- [x] Calendar import and event suggestion  
- [ ] XP & currency reward system  
- [ ] Avatar and shop UI  
- [ ] Persistent database (Postgres/Supabase)  
- [ ] Deployment (Railway / Render / Fly.io)

---

## 👩‍🚀 Contributing

This project was built in a hackathon setting — contributions are welcome! Fork the repo, make your changes, and submit a PR.

---

## 📜 License

MIT License © 2025

---

## 🏁 Inspiration

LifeQuest was born from the idea that **habit-building should feel rewarding**. By merging agentic AI, natural language planning, and gamified feedback loops, we’re turning self-improvement into something you *want* to do — not something you *have* to do.
