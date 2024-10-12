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


def generate_script(docs_path: str, video_length: int, language: str) -> str:
    load_dotenv(find_dotenv())
    genai.configure(api_key=os.environ["GEMINI_API_KEY"])
    model = genai.GenerativeModel("gemini-1.5-flash")
    sample_pdf = genai.upload_file(docs_path)
    llm_prompt = """
        <prompt>
            <step1>Extract the key information from the document and identify the main points that need to be discussed.</step1>
            <step2>Break down these main points into smaller subtopics that can be explained sequentially.</step2>
            <step3>For each subtopic, construct a simple and engaging explanation that fits naturally into a continuous narrative.</step3>
            <step4>Ensure that each subtopic flows logically into the next, maintaining coherence and a clear structure.</step4>
            <step5>Use simple and concise language, keeping the audience's attention with relatable examples or anecdotes where necessary.</step5>
            <step6>Review the entire monologue to make sure it includes all the important information from the original document.</step6>
            <step7>Don't include anything related to QR code or any link</step7>
            <step8>Return the script only. The response should start with the script and end with it</step8>
            <step9>Response should not contain anything like Script: </step9>
        </prompt>
        """

    # Add video length to the prompt
    # Adding the video length to the prompt

    llm_prompt += f"\n\n<!-- Please make the script approximately {video_length} seconds long. -->"

    # Adding the language conditionally
    if language != "English":
        llm_prompt += f"\n\n<!-- Please make the script in {language}. -->"

    response = model.generate_content([llm_prompt, sample_pdf])
    return response.text


def generate_keywords(text: str):
    GEMINI_API_KEY = os.environ["GEMINI_API_KEY"]
    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel("gemini-1.5-flash")
    
    llm_prompt = """
        Given the script, divide the text into logical chunks such that each chunk represents 3 seconds of content. For each chunk, provide the most general and straightforward image generation prompt in the form of a phrase of maximum 5 words that capture the core visual theme or concept of that part of the script. The keywords should avoid ambiguous or complex terms and focus on general, easily interpretable visuals for example-(man in hospital, car accident). I basically want simplest and general words only. Output the keywords as a python list, ready for sequential use in a generative AI image generation API. there shouldn't be any abstract thing in the prompt.. just ensure it has nouns and physical things all the time.
        """
    response = model.generate_content(llm_prompt + text)
    start_idx = response.text.find("[")
    end_idx = response.text.rfind("]") + 1
    trimmed_response = response.text[start_idx:end_idx]

    return ast.literal_eval(trimmed_response)





def generate_keywords_fast(text: str):
    GEMINI_API_KEY = os.environ["GEMINI_API_KEY"]
    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel("gemini-1.5-flash")
    llm_prompt = """
    Given the script, create a JSON output that organizes the key themes and concepts presented in the text into a structured format. Each entry in the JSON array should include a 'slide_title', 'bullet_points', and 'keywords' field. 

    - 'slide_title' should contain a brief title for the slide.
    - 'bullet_points' should summarize the main ideas in concise bullet points.
    - 'keywords' should contain relevant keywords associated with the slide, suitable for searching images in an image library API.

    The output format should be:
    [
      {
        "slide_title": "Title of the slide",
        "bullet_points": [
          "Key point 1",
          "Key point 2",
          "Key point 3"
        ],
        "keyword": "keyword"
      },
      ...
    ]
    
    Ensure that the titles, bullet points, and keywords reflect the most important information from the script. Provide the output as a JSON structure.
    """

    response = model.generate_content(llm_prompt + text)
    start_idx = response.text.find("[")
    end_idx = response.text.rfind("]") + 1
    trimmed_response = response.text[start_idx:end_idx]

    return ast.literal_eval(trimmed_response)


def get_prompts_from_script(script: str) -> List[str]:
    return [script]
