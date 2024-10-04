import os
import json
from typing import List
from dotenv import load_dotenv, find_dotenv
import azure.cognitiveservices.speech as speechsdk
from moviepy.editor import TextClip, ColorClip, CompositeVideoClip, AudioFileClip
import moviepy.editor as mpy
import aiohttp
import asyncio
from moviepy.editor import ImageClip, concatenate_videoclips
from PIL import Image
from io import BytesIO
import numpy as np
from video_generator.functionalities.text_processing import generate_keywords
from dotenv import load_dotenv, find_dotenv
import random

load_dotenv(find_dotenv())

unsplash_api_key = os.environ["UNSPLASH_API_KEY"]
pixabay_api_key = os.environ["PIXABAY_API_KEY"]


async def fetch_image_from_unsplash(session, keyword):
    url = f"https://api.unsplash.com/search/photos?query={keyword}&client_id={unsplash_api_key}"
    async with session.get(url) as response:
        if response.status == 200:
            data = await response.json()
            num = random.randint(1, 5)
            if data["results"]:
                if data["results"][num]:
                    return data["results"][num]["urls"]["small"]
                return data["results"][0]["urls"]["small"]
    return None


async def fetch_image_from_pixabay(session, keyword):
    url = f"https://pixabay.com/api/?key={pixabay_api_key}&q={keyword}&image_type=photo"
    async with session.get(url) as response:
        if response.status == 200:
            data = await response.json()
            if data["hits"]:
                num = random.randint(1, 5)
                if data["hits"][num]:
                    return data["hits"][num]["largeImageURL"]
                return data["hits"][0]["largeImageURL"]
    return None


async def fetch_image_bytes(session, img_url):
    """
    Fetch the image bytes from the URL.
    """
    async with session.get(img_url) as img_response:
        if img_response.status == 200:
            return await img_response.read()
    return None


async def fetch_images_as_clips(keywords):
    """
    Fetch images for the given keywords, convert them to in-memory ImageClips,
    and return the list of ImageClips.
    """
    clips = []
    async with aiohttp.ClientSession() as session:
        for keyword in keywords:
            img_url = await fetch_image_from_unsplash(session, keyword)

            if not img_url:
                img_url = await fetch_image_from_pixabay(session, keyword)

            if img_url:
                img_data = await fetch_image_bytes(session, img_url)
                if img_data:
                    img = Image.open(BytesIO(img_data)).convert("RGB")
                    img_np = np.array(img)  # Convert PIL image to NumPy array
                    img_clip = ImageClip(img_np).set_duration(
                        5
                    )  # Set duration of each image to 5 seconds
                    clips.append(img_clip)
                    print(f"Downloaded and added image for keyword: {keyword}")
            else:
                print(f"No images found for: {keyword}")
    return clips


def generate_speech_and_viseme_from_text(
    script: str, audio_output_file: str, viseme_output_file: str, video_output_file: str
):
    load_dotenv(find_dotenv())
    speech_key = os.environ["AZURE_SPEECH_API_KEY"]
    service_region = "eastus"

    # Create a speech configuration object
    speech_config = speechsdk.SpeechConfig(
        subscription=speech_key, region=service_region
    )

    # Create an audio configuration for saving the audio to a file
    audio_config = speechsdk.audio.AudioOutputConfig(filename=audio_output_file)

    # Create a speech synthesizer object
    synthesizer = speechsdk.SpeechSynthesizer(
        speech_config=speech_config, audio_config=audio_config
    )

    viseme_data = []

    def viseme_cb(evt):
        viseme_data.append(
            {
                "offset": evt.audio_offset / 10000,  # Convert to milliseconds
                "id": evt.viseme_id,
            }
        )

    # Synthesize the text
    result = synthesizer.speak_text_async(script).get()

    if result.reason == speechsdk.ResultReason.SynthesizingAudioCompleted:
        print(
            f"Text-to-speech conversion successful. Audio saved to {audio_output_file}"
        )
    else:
        print(f"Text-to-speech conversion failed: {result.reason}")
        return

    # Save viseme data to a file
    with open(viseme_output_file, "w", encoding="utf-8") as f:
        json.dump(viseme_data, f, indent=2)
    print(f"Viseme data saved to {viseme_output_file}")

    return viseme_data


async def generate_video_from_script(
    script: str, audio_output_file: str, video_output_file: str
):
    """
    Fetch images for the given keywords and generate a video that matches the length of the audio.
    """
    audio_clip = AudioFileClip(audio_output_file)
    audio_duration = audio_clip.duration  # Get the duration of the audio in seconds
    keywords = generate_keywords(script)
    clips = await fetch_images_as_clips(keywords)

    if clips:
        num_clips = len(clips)
        # Calculate the duration each image should stay on screen
        clip_duration = audio_duration / num_clips

        landscape_clips = []
        for clip in clips:
            img = clip.get_frame(0)  # Get a frame from the clip
            pil_img = Image.fromarray(img)  # Convert to a PIL Image

            # Resize the image to landscape (1280x720) using LANCZOS
            resized_img = pil_img.resize((1280, 720), Image.Resampling.LANCZOS)

            # Convert the resized image back to a NumPy array
            resized_array = np.array(resized_img)

            # Create a new ImageClip from the resized image with the calculated duration
            landscape_clip = ImageClip(resized_array).set_duration(clip_duration)
            landscape_clips.append(landscape_clip)

        # Concatenate the resized landscape clips into a single video
        video_clip = concatenate_videoclips(landscape_clips, method="compose")

        # Add the audio to the video
        final_video = video_clip.set_audio(audio_clip)
        final_video.write_videofile(video_output_file, fps=24)
        print(f"Video saved as {video_output_file}")
    else:
        print("No images to generate video.")
