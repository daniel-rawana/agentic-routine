# NOTE: Minimal stubs for hackathon speed.
# Replace with real Google Calendar CRUD via google-api-python-client.
from typing import List

class CalendarService:
    async def list_upcoming_events(self, user_id: str) -> List[dict]:
        # TODO: Use stored OAuth tokens tied to user_id to call Google Calendar.
        return [
            {"summary": "CS Lecture", "start": "2025-09-29T10:00:00", "end": "2025-09-29T11:15:00"},
            {"summary": "Study Block", "start": "2025-09-29T14:00:00", "end": "2025-09-29T16:00:00"},
        ]

    async def create_events(self, user_id: str, events: list[dict]) -> int:
        # TODO: Implement create via API
        return len(events)
