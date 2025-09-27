from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import RedirectResponse
from ..utils.oauth import google_oauth_flow, exchange_code_for_tokens, get_userinfo
from ..utils.config import settings

router = APIRouter()

@router.get("/google/login")
async def google_login():
    auth_url, state = google_oauth_flow()
    # In a real app, persist `state` per-session
    return {"auth_url": auth_url, "state": state}

@router.get("/google/callback")
async def google_callback(code: str, state: str):
    try:
        tokens = await exchange_code_for_tokens(code)
        userinfo = await get_userinfo(tokens["access_token"])
        # TODO: upsert user in DB
        return {"ok": True, "user": userinfo}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
