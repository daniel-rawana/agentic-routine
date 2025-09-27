import os
import datetime as dt
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

SCOPES = ['https://www.googleapis.com/auth/calendar.events']

def write_to_calendar(event_summary: str, start_time: str, end_time: str) -> bool:
    """Writes events into the user's calendar

    Args:
        event_summary (str): The title or summary of the event.
        start_time (str): Event start time in ISO 8601 format 
                          (e.g., '2025-09-29T15:00:00-04:00').
        end_time (str): Event end time in ISO 8601 format 
                        (e.g., '2025-09-29T16:00:00-04:00').

    Returns:
        bool: A boolean value that indicates wheter the function was executed correctly
    """
    print(f"--- Tool: write_to_calendar called for: {event_summary} ---") 
    creds = None 

    if os.path.exists('token.json'):
        creds = Credentials.from_authorized_user_file('token.json', SCOPES)

    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refres(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file('credentials.json', SCOPES)
            creds = flow.run_local_server(port=0)
        with open('token.json', 'w') as token:
            token.write(creds.to_json())

    try:
        service = build('calendar', 'v3', credentials=creds)
        
        event = {
            'summary': event_summary,
            'start': {
                'dateTime': start_time,
                'timeZone': 'UTC',
            },
            'end': {
                'dateTime': end_time,
                'timeZone': 'UTC',
            },
        }
        
        created_event = service.events().insert(calendarId='primary', body=event).execute()
        print(f"Event created: {created_event.get('htmlLink')}")
        return True

    except HttpError as error:
        print(f"An error occurred: {error}")
        return False