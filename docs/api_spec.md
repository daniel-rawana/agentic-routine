# API Spec (MVP)

## Auth
- `GET /api/auth/google/login` → `{ auth_url, state }`
- `GET /api/auth/google/callback?code&state` → `{ ok, user }`

## Agent
- `POST /api/agent/chat` body `{ user_id, message }` → `{ reply }`
- `POST /api/agent/bootstrap/{user_id}` → `{ events, proposal }`

## Tasks
- `GET /api/tasks/` → `Task[]`
- `POST /api/tasks/` → `Task`
- `POST /api/tasks/complete/{task_id}` → `{ ok }`
