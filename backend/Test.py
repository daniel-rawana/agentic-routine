# @title Import necessary libraries
import asyncio
from google.adk.sessions import InMemorySessionService
from google.adk.runners import Runner
from google.genai import types # For creating message Content/Parts
from agents.root_agent import root_agent

import warnings
# Ignore all warnings
warnings.filterwarnings("ignore")

import logging
# Suppress asyncio SSL warnings
logging.getLogger('asyncio').setLevel(logging.CRITICAL)
logging.basicConfig(level=logging.ERROR)

MODEL_GEMINI_2_0_FLASH = "gpt-4o-mini"

# Define constants for identifying the interaction context
APP_NAME = "weather_tutorial_app"
USER_ID = "user_1"
SESSION_ID = "session_001"

# Global variables to be initialized in setup_session
session_service = None
session = None
runner = None

async def setup_session():
    """Initialize session service, session, and runner."""
    global session_service, session, runner
    
    session_service = InMemorySessionService()
    
    # Create the specific session where the conversation will happen
    session = await session_service.create_session(
        app_name=APP_NAME,
        user_id=USER_ID,
        session_id=SESSION_ID
    )
    print(f"Session created: App='{APP_NAME}', User='{USER_ID}', Session='{SESSION_ID}'")
    
    # Create runner to orchestrate the agent execution loop
    runner = Runner(
        agent=root_agent,
        app_name=APP_NAME,
        session_service=session_service
    )
    print(f"Runner created for agent '{runner.agent.name}'.")

async def call_agent_async(query: str, runner, user_id, session_id):
  """Sends a query to the agent and prints the final response."""
  print(f"\n>>> User Query: {query}")

  # Prepare the user's message in ADK format
  content = types.Content(role='user', parts=[types.Part(text=query)])

  final_response_text = "Agent did not produce a final response." # Default

  # Key Concept: run_async executes the agent logic and yields Events.
  # We iterate through events to find the final answer.
  async for event in runner.run_async(user_id=user_id, session_id=session_id, new_message=content):
      # You can uncomment the line below to see *all* events during execution
      # print(f"  [Event] Author: {event.author}, Type: {type(event).__name__}, Final: {event.is_final_response()}, Content: {event.content}")

      # Key Concept: is_final_response() marks the concluding message for the turn.
      if event.is_final_response():
          if event.content and event.content.parts:
             # Assuming text response in the first part
             final_response_text = event.content.parts[0].text
          elif event.actions and event.actions.escalate: # Handle potential errors/escalations
             final_response_text = f"Agent escalated: {event.error_message or 'No specific message.'}"
          # Add more checks here if needed (e.g., specific error codes)
          break # Stop processing events once the final response is found

  print(f"<<< Agent Response: {final_response_text}")

async def run_conversation():
    """Main conversation function that sets up session and runs queries."""
    try:
        # Initialize session and runner
        await setup_session()
        
        # Run conversation queries
        await call_agent_async(f"What are the upcoming events on my calendar? ? ",
                              runner=runner,
                              user_id=USER_ID,
                              session_id=SESSION_ID)
    finally:
        # Properly close any open connections
        if runner and hasattr(runner, 'close'):
            await runner.close()

async def main():
    """Main entry point with proper cleanup."""
    try:
        await run_conversation()
    except Exception as e:
        print(f"An error occurred: {e}")
    finally:
        # Give more time for cleanup and close any pending tasks
        await asyncio.sleep(0.5)
        
        # Cancel any remaining tasks
        tasks = [task for task in asyncio.all_tasks() if not task.done()]
        for task in tasks:
            task.cancel()
        
        if tasks:
            await asyncio.gather(*tasks, return_exceptions=True)

if __name__ == "__main__":
    # Use a custom event loop policy to handle cleanup better
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\nInterrupted by user")
    except Exception as e:
        print(f"An error occurred: {e}")
    finally:
        # Force garbage collection to clean up any remaining objects
        import gc
        gc.collect()