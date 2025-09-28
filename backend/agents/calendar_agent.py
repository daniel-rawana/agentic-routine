import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from google.adk.agents import Agent
from tools.calendar_tools import write_to_calendar, get_upcoming_events, delete_event
from google.adk.agents import Agent
from google.adk.models.lite_llm import LiteLlm
# from google.adk.models.lite_llm import LiteLlm 

AGENT_MODEL = "gemini-2.0-flash-exp"

calendar_agent = Agent(
    name="calendar_agent",
    model=AGENT_MODEL, 
    description="Reads and writes to user's calendar and suggests time slots.",
    instruction="You are a calendar and scheduling agent. "
                "Your ONLY core tasks are read/write/delete from user's calendar via the write_to_calendar and delete_event tools, "
                "suggest time slots for tasks, and break down large tasks into substasks.",
    tools=[write_to_calendar, get_upcoming_events, delete_event], 
)