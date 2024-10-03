import os
from typing import List
import google.generativeai as genai
import pdfplumber
from dotenv import load_dotenv, find_dotenv
import ast


def extract_text(file_path) -> str:
    extracted_text = ""
    with pdfplumber.open(file_path) as f:
        for page in f.pages:
            page_text = page.extract_text()
            if page_text:
                extracted_text += page_text

    return extracted_text


def generate_script(text: str, video_length: int) -> str:
    load_dotenv(find_dotenv())
    genai.configure(api_key=os.environ["GEMINI_API_KEY"])
    model = genai.GenerativeModel("gemini-1.5-flash")

    llm_prompt = """
    Given the following extracted content from a document, rewrite it as a continuous, engaging monologue.
    The monologue should flow naturally, as if delivered by a speaker giving an in-depth explanation or lecture.
    Present the information in a coherent and narrative style that maintains the listener’s interest.
    Ensure the text is suitable for speech, aiming to educate and captivate the audience with a clear and engaging delivery, keep it simple, use simple words.
    Do not miss any important information.
    """

    # Add video length to the prompt
    llm_prompt += (
        f"\n\nPlease make the script approximately {video_length} seconds long."
    )

    response = model.generate_content(llm_prompt + text)

    return response.text


def generate_keywords(text: str):
    GEMINI_API_KEY = os.environ["GEMINI_API_KEY"]
    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel("gemini-1.5-flash")
    llm_prompt = """
    Given the extracted content from a document, generate 20 one or max three words keywords for use as prompts in image generation from the provided text. Each phrase should be vivid and descriptive, evoking clear visual imagery while avoiding any company names, trademarked terms, or specific generative AI model names. The phrases should be suitable for a variety of creative concepts and should inspire diverse artistic interpretations. Output should be a python list with no name just list
    """
    response = model.generate_content(llm_prompt + text)
    start_idx = response.text.find("[")
    end_idx = response.text.rfind("]") + 1
    trimmed_response = response.text[start_idx:end_idx]

    return ast.literal_eval(trimmed_response)


def get_prompts_from_script(script: str) -> List[str]:
    return [script]
