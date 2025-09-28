import os
import datetime as dt
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

SCOPES = ['https://www.googleapis.com/auth/calendar.events']

def authenticate(): 
    """Handles OAuth authentication and token management."""
    creds = None 

    if os.path.exists('token.json'):
        creds = Credentials.from_authorized_user_file('token.json', SCOPES)

    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file('credentials.json', SCOPES)
            creds = flow.run_local_server(port=0)
        with open('token.json', 'w') as token:
            token.write(creds.to_json())

    return build('calendar', 'v3', credentials=creds)

def write_to_calendar(event_summary: str, start_time: str, end_time: str) -> dict:
    """Writes events into the user's calendar

    Args:
        event_summary (str): The title or summary of the event.
        start_time (str): Event start time in ISO 8601 format 
                          (e.g., '2025-09-29T15:00:00-04:00').
        end_time (str): Event end time in ISO 8601 format 
                        (e.g., '2025-09-29T16:00:00-04:00').

    Returns:
        dict: Status of the request and htmlLink or error msg
    """
    print(f"--- Tool: write_to_calendar called for: {event_summary} ---") 

    try:
        
        service = authenticate()
        
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
        return {
            "status": "success",
            "htmlLink": created_event.get('htmlLink')
        }

    except HttpError as error:
        print(f"An error occurred: {error}")
        return {
            "status": "error"
        }
    
def get_upcoming_events(max_results: int = 10):
    """
    Fetches upcoming events and returns them as a list of dictionaries.

    Args:
        max_results (int): Maximum number of upcoming events to fetch. Default is 10.

    Returns:
        list[dict]: List of events, each with keys like 'summary', 'start', 'end', 'id', or error msg
    """
    try:
        service = authenticate()
        now = dt.datetime.now(dt.timezone.utc).isoformat() 
        
        events_result = service.events().list(
            calendarId='primary',
            timeMin=now,
            maxResults=max_results,
            singleEvents=True,
            orderBy='startTime'
        ).execute()
        
        events = events_result.get('items', [])
        return events
    
    except HttpError as error:
        return [{
            "error": f"An error occurred: {error}"
        }]

def delete_event(event_id: str) -> dict:
    """
    Deletes an event from the user's calendar by event ID.

    Args:
        event_id (str): A string containing the id of the event to delete

    Returns:
        dict: A dictionary containing the status code of the operation or error msg
    """
    try:
        service = authenticate()

        service.events().delete(calendarId='primary', eventId=event_id).execute()

        return {
            "status": "success"
        }
    except HttpError as error:
        return {
            "error": f"An error occurred: {error}"
        }
    
def update_event(event_id: str, update_fields: dict) -> dict:
    """
    Updates an event in the user's calendar by event ID.

    Args:
        event_id (str): A string containing the id of the event to update
        update_fields (dict): A dictionary containing the data of the updated event

    Returns:
        dict: A dictionary containing the updated event and status code or error msg
    """
    try:
        service = authenticate()

        event = service.events().get(calendarId='primary', eventId=event_id).execute()

        event.update(update_fields)

        update_event = service.events().update(calendarId='primary', eventId=event_id, body=event).execute()

        return {
            "event": update_event,
            "status": "success"
        }
    except HttpError as error:
        return {
            "status": "error",
            "message": error
        }