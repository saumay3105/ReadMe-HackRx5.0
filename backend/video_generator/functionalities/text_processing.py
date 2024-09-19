import os
from typing import List
import google.generativeai as genai
import pdfplumber
from dotenv import load_dotenv, find_dotenv


def extract_text(file_path) -> str:
    extracted_text = ""
    with pdfplumber.open(file_path) as f:
        for page in f.pages:
            page_text = page.extract_text()
            if page_text:
                extracted_text += page_text

    return extracted_text


def generate_script(text: str) -> str:
    load_dotenv(find_dotenv())
    genai.configure(api_key=os.environ["GEMINI_API_KEY"])
    model = genai.GenerativeModel("gemini-1.5-flash")
    llm_prompt = """
    Given the following extracted content from a document, rewrite it as a continuous, engaging monologue.
    The monologue should flow naturally, as if delivered by a speaker giving an in-depth explanation or lecture.
    present the information in a coherent and narrative style that maintains the listener’s interest.
    Ensure the text is suitable for speech, aiming to educate and captivate the audience with a clear and engaging delivery, keep it simple, use simple words.
    Do not miss any important information.
    """
    response = model.generate_content(llm_prompt + text)

    return response.text


def get_prompts_from_script(script: str) -> List[str]:
    return [script]
