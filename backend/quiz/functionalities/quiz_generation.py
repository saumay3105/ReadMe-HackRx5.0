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

    Based on this text, generate pool of 20 questions that include a variety of question types:
    - Multiple-choice (MCQ)
    - True/false
    - Fill in the blanks (with options)

    For each question, output the response in the following JSON format:

    [
      {{
        question: "Question 1 text here?",
        options: ["Option 1", "Option 2", "Option 3", "Option 4"],
        correctAnswer: "Correct option here",
        explanation: "Explanation for the answer here",
        type: "mcq" or "true-false" or "fill-in-the-blank",
        difficulty: "Easy" or "Medium" or "Hard"
        use:"normal"
      }},
      {{
        question: "Question 2 text here?",
        options: ["Option 1", "Option 2", "Option 3", "Option 4"],
        correctAnswer: "Correct option here",
        explanation: "Explanation for the answer here",
        type: "mcq" or "true-false" or "fill-in-the-blank",
        difficulty: "Easy" or "Medium" or "Hard"
        use:"substitute"
      }},
      ...
    ]

    Ensure:
    - The correct answers are accurate and based on the provided text.
    - The questions are a mix of different types (multiple-choice, true/false, fill-in-the-blanks).
    - Each question is labeled with the appropriate difficulty level: "Easy," "Medium," or "Hard". 
    - I need 10 questions for the quiz and 10 subsitutes of only easy and medium type. 
    - Provide a detailed explanations for each correct answer.
    

    Reply with just the JSON response and nothing else.
    """

    response = model.generate_content(llm_prompt)

    return response.text
