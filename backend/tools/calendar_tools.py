import os.path
import datetime as dt

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

def write_to_calendar(event: str) -> bool:
    """Writes events into the user's calendar

    Args:
        event (str): The event the user wants to save in their calendar.

    Returns:
        bool: A boolean value that indicates wheter the function was executed correctly
    """
    print(f"--- Tool: write_to_calendar called for: {event} ---") # Log tool execution

    return True