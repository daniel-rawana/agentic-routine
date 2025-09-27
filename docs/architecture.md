# Architecture

```
React (Vite) ──axios──► FastAPI ──► Services
                             ├─ CalendarService (Google Calendar API)
                             ├─ AgentService (Gemini)
                             └─ Gamification (XP/Money rules)
```

- **Stateless** endpoints for agent chat and bootstrap.
- **OAuth** stored per user (stubbed). Real app would persist refresh tokens.
