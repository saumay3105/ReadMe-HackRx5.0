import os
import google.generativeai as genai
from dotenv import load_dotenv, find_dotenv


def generate_quiz_questions(text: str) -> str:
    load_dotenv(find_dotenv())
    genai.configure(api_key=os.environ["GEMINI_API_KEY"])
    model = genai.GenerativeModel("gemini-1.5-flash")

    llm_prompt = f"""
    You are provided with the following text: 

    {text}

    Based on this text, generate 10 multiple-choice questions (MCQs).
    Each question should have four options, and the correct answer should be included.
    Output the response in the following JSON format:
    
    [
      {{
        "question": "Question 1 text here?",
        "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
        "correctAnswer": "Correct option here"
      }},
      {{
        "question": "Question 2 text here?",
        "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
        "correctAnswer": "Correct option here"
      }},
      ...
    ]

    Ensure the correct answers are accurate and based on the provided text. Reply with just json response and nothing else.
    """

    response = model.generate_content(llm_prompt)

    return response.text
