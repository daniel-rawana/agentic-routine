import os, httpx, json
from typing import Any
from ..utils.config import settings

GEMINI_API = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent"

class AgentService:
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY

    async def generate(self, prompt: str) -> str:
        if not self.api_key:
            return "Gemini API key missing. Set GEMINI_API_KEY."
        payload = {
            "contents": [{"parts": [{"text": prompt}]}]
        }
        params = {"key": self.api_key}
        async with httpx.AsyncClient(timeout=30) as client:
            r = await client.post(GEMINI_API, params=params, json=payload)
            r.raise_for_status()
            data = r.json()
        try:
            return data["candidates"][0]["content"]["parts"][0]["text"]
        except Exception:
            return json.dumps(data)

    def build_routine_prompt(self, events: list[dict]) -> str:
        bullets = "\n".join(f"- {e['summary']} {e['start']}–{e['end']}" for e in events)
        return (
            "You are a taskmaster agent helping a student design weekly routines.\n"
            "Given upcoming calendar events, propose a weekly routine with specific times for: "
            "wake-up, gym 3x/week, study blocks, and self-care. "
            "Output JSON with keys: routines[], proposed_events[].\n"
            "Upcoming events:\n" + bullets
        )

    async def handle_message(self, user_id: str, message: str) -> str:
        prompt = (
            "You are a supportive but firm taskmaster. The user said:\n"
            f"{message}\n"
            "Respond concisely with next actions and proposed calendar entries if relevant."
        )
        return await self.generate(prompt)
