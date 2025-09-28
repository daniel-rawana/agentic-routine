import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from google.adk.agents import Agent
from tools.syllabus_tools import extract_pdf_text, extract_assignments
from google.adk.models.lite_llm import LiteLlm

AGENT_MODEL = "gemini-2.0-flash-exp"

syllabus_agent = Agent(
    name="syllabus_agent",
    model=AGENT_MODEL, 
    description="Extracts and parses through PDFs to extract the assignment dates and descriptions from a syllabus.",
    instruction= """
                You are a syllabus parser agent.
                Your ONLY core tasks are to extract the text from a syllabus in PDF format using the extract_pdf_text tool and
                parse through its text to extract the assignment dates and descriptions if available with extract_assignments.
                When you return assignments with due dates to the user, do it in a numbered format, for example:

                1. AI project
                - Due Date: Sep 29, 2025

                2. Another project
                - Due Date: Oct 5, 2025
                """,  
    tools=[extract_pdf_text, extract_assignments]
)