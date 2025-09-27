import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from google.adk.agents import Agent
from tools.syllabus_tools import extract_pdf_text, extract_assignments
from google.adk.models.lite_llm import LiteLlm

AGENT_MODEL = AGENT_MODEL = "gemini-2.5-flash"

syllabus_agent = Agent(
    name="root_agent",
    model=AGENT_MODEL, 
    description="Extracts and parses through PDFs to extract the assignment dates and descriptions from a syllabus.",
    instruction="You are a syllabus parser agent. "
                "Your ONLY core tasks are to extract the text from a syllabus in PDF format using the extract_pdf_text tool and "
                "parse through its text to extract the assignment dates and descriptions if available with extract_assignments.",
    tools=[extract_pdf_text, extract_assignments]
)