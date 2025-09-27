def write_to_calendar(event: str) -> bool:
    """Writes events into the user's calendar

    Args:
        event (str): The event the user wants to save in their calendar.

    Returns:
        bool: A boolean value that indicates wheter the function was executed correctly
    """
    print(f"--- Tool: write_to_calendar called for: {event} ---") # Log tool execution

    return True