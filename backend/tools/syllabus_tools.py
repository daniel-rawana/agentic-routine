import pdfplumber 
import os
import google.genai as genai

ASSIGNMENTS_YEAR = "2025"
GENERATIVE_MODEL = "gemini-2.0-flash-exp"

def extract_pdf_text(file_path: str) -> dict:
    """Extracts the text from a pdf file

    Args:
        file_path (str): The path of the pdf file

    Returns:
        dict: Status and extracted text as a str or error msg
    """
    print("Agent called extract text tool\n")
    full_text = "" 
    try: 
        with pdfplumber.open(file_path) as pdf: 
            for page in pdf.pages: 
                text = page.extract_text()
                if text:
                    full_text += f"{text}\n"
        return {
            "status": "success",
            "text": full_text.strip() 
        }

    except Exception as e: 
        return {
            "status": "error",
            "exception_code": e
        } 
    
def extract_assignments(syllabus_text: str) -> dict:
    """
        Receives raw syllabus text, uses the Gemini model to extarct assignment dates,
        and returns them as a JSON formatted string.

        Args:
            syllabus_text (str): The full text of the syllabus to parse

        Returns:
            dict: Status and str containing the structured JSON of extracted assignments or error msg
    """

    print("Agent called extract assignments tool\n")

    try:
        # Configure and create client
        client = genai.Client(api_key=os.getenv('GEMINI_API_KEY'))

        prompt = f"""
You are an expert academic assistant. Your task is to extract all assignments and their due dates from the provided syllabus text.

Return the information ONLY as bullet points for each assignment with:
- "assignment_name": The name of the assignment (string).
- "due_date": The due date in "YYYY-MM-DD" format (string). Use the year {ASSIGNMENTS_YEAR}.
- "description": The description if available (string). Else leave it as an empty string.

Do not include any other text, explanations, or markdown formatting.

Syllabus Text:
---
{syllabus_text}
---
"""
        
        response = client.models.generate_content(
            model=GENERATIVE_MODEL,
            contents=prompt
        )
        
        return {
            "status": "success",
            "assignments": response.text
        }
        
    except Exception as e:
        print(f"Error in extract_assignments: {e}")
        return {
            "status": "error",
            "error": str(e)
        }