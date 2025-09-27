# Minimal Google OAuth web flow helpers — stubbed for hackathon wiring.
import secrets
from typing import Tuple

def google_oauth_flow() -> Tuple[str, str]:
    # Return auth URL & state
    state = secrets.token_urlsafe(16)
    auth_url = "https://accounts.google.com/o/oauth2/v2/auth?client_id=CLIENT_ID&scope=openid%20email%20profile%20https://www.googleapis.com/auth/calendar&redirect_uri=REDIRECT_URI&response_type=code&access_type=offline&prompt=consent&state=" + state
    return auth_url, state

async def exchange_code_for_tokens(code: str) -> dict:
    # TODO: Implement token exchange
    return {"access_token": "stub", "refresh_token": "stub"}

async def get_userinfo(access_token: str) -> dict:
    # TODO: Call https://openidconnect.googleapis.com/v1/userinfo
    return {"email": "user@example.com", "name": "Student Hacker"}
