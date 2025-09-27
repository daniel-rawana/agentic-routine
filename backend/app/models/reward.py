from pydantic import BaseModel

class Reward(BaseModel):
    id: str
    name: str
    cost: int
    xp_required: int
