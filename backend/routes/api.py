from fastapi import APIRouter

router = APIRouter(tags=["API"])

@router.get("/hello")
async def hello(name: str = "World"):
    return {"message": f"Hello, {name}!"}

from fastapi import APIRouter

router = APIRouter(tags=["API"])

@router.post("/echo")
async def echo(payload: dict):
    message = payload.get("message", "")
    print(f"Received message: {message}")  # ✅ printed to backend console
    return {"you_sent": {"message": message}}
