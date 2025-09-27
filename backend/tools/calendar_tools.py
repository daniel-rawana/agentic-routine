import os
import datetime as dt
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

SCOPES = ['https://www.googleapis.com/auth/calendar.events']

def write_to_calendar(event: str) -> bool:
    """Writes events into the user's calendar

    Args:
        event (str): The event the user wants to save in their calendar.

    Returns:
        bool: A boolean value that indicates wheter the function was executed correctly
    """
    print(f"--- Tool: write_to_calendar called for: {event} ---") 
    creds = None 

    if os.path.exists('credentials.json'):
        creds = Credentials.from_authorized_user_file('credentials.json', SCOPES)

    return True