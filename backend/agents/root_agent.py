import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from google.adk.agents import Agent
from google.adk.models.lite_llm import LiteLlm
from agents.calendar_agent import calendar_agent
from agents.syllabus_agent import syllabus_agent

AGENT_MODEL = "gemini-2.5-flash"

root_agent = Agent(
    name="root_agent",
    model= AGENT_MODEL, 
    description="Captures user input and routes it to the right specialist agent.",
    instruction="You are an intelligent taskmaster agent " \
                "helping students improve their time management habits." \
                "You have speialized sub-agents: " \
                "1. calendar_agent: Handles CRUD operations in the user's calendar via Google's API." \
                "2. syllabus_agent: Extracts text from submitted PDF files and parses through plain text to extract " \
                "assignment dates, name, and descriptions." \
                "Analyze the user's query, delegate all calendar writing/reading tasks to the calendar_agent, " \
                "and all syllabus parsing tasks to the syllabus_agent. For anything else, respond appropiately or state you cannot handle the request.",
    tools=[], 
    sub_agents=[calendar_agent, syllabus_agent]
)