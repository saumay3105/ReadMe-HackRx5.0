import os
import json
from typing import List
from dotenv import load_dotenv, find_dotenv
import azure.cognitiveservices.speech as speechsdk
from moviepy.editor import TextClip, ColorClip, CompositeVideoClip, AudioFileClip
import moviepy.editor as mpy


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


def synthesize_video(script: str, images: List[str], video_output_file):
    background_clip = ColorClip(size=(640, 480), color=(0, 0, 0), duration=50)

    # Create a text clip with the script text
    text_clip = TextClip(
        script,
        fontsize=24,
        color="white",
    )

    # Set the duration for the video (match it with the audio length if needed)
    text_clip = text_clip.set_duration(50).set_position("center")

    # Create a video with the text
    video = CompositeVideoClip([background_clip, text_clip])

    # Write the video to a file
    video.write_videofile(video_output_file, fps=24)

    return video


def generate_video_from_script(
    script: str, audio_output_file: str, video_output_file: str
):
    # Load the audio file to get its duration
    audio_clip = AudioFileClip(audio_output_file)
    total_duration = audio_clip.duration

    print(total_duration)

    # Split the script into manageable segments
    words = script.split()
    words_per_screen = 20
    total_words = len(words)
    screens_needed = (total_words + words_per_screen - 1) // words_per_screen
    time_per_screen = total_duration / screens_needed

    # Create video clips for each text segment
    video_clips = []
    for i in range(screens_needed):
        start_index = i * words_per_screen
        end_index = min(start_index + words_per_screen, total_words)
        text_segment = " ".join(words[start_index:end_index])

        # Create a background clip
        background_clip = ColorClip(
            size=(640, 480), color=(0, 0, 0), duration=time_per_screen
        )

        # Create a text clip
        text_clip = (
            TextClip(
                text_segment,
                fontsize=24,
                color="white",
                size=(500, 400),
                method="caption",
            )
            .set_duration(time_per_screen)
            .set_position("center")
        )

        # Combine background and text
        video_clip = CompositeVideoClip([background_clip, text_clip])
        video_clips.append(video_clip)

    # Concatenate all video clips
    final_video = mpy.concatenate_videoclips(video_clips)

    # Set audio to the final video
    final_video = final_video.set_audio(audio_clip)

    # Write the final video to a file
    final_video.write_videofile(video_output_file, fps=24)
