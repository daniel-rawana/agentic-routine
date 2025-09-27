import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from google.adk.agents import Agent
from agents.calendar_agent import calendar_agent
# from google.adk.models.lite_llm import LiteLlm 

MODEL_GEMINI_2_0_FLASH = "gemini-2.0-flash"

AGENT_MODEL = MODEL_GEMINI_2_0_FLASH 

root_agent = Agent(
    name="root_agent",
    model=AGENT_MODEL, 
    description="Captures user input and routes it to the right specialist agent.",
    instruction="You are an intelligent taskmaster "
                "agent managing a student's real-world schedule.",
    tools=[], 
    sub_agents=[calendar_agent]
)