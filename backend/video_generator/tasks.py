import os
import logging
from django.conf import settings
import asyncio
import uuid
from django.core.exceptions import ObjectDoesNotExist
from celery import shared_task

from .models import DocumentProcessingJob, VideoProcessingJob
from .functionalities.text_processing import (
    generate_script,
)
from .functionalities.video_synthesis import generate_speech_and_viseme_from_text, generate_video_from_script, generate_video_from_script_fast


@shared_task
def generate_script_task(job_id: uuid.UUID, video_length: int,language:str,speed:str):
    job = DocumentProcessingJob.objects.get(job_id=job_id)
    job.status = "processing"
    job.save()

    try:
        file_path = job.file.path
        script = generate_script(
            file_path, video_length, language
        )  # Pass video_length to generate_script

        # Update job status to 'successful' and save the generated script
        job.status = "successful"
        job.script = script

    except Exception as e:
        job.status = "failed"
        job.script = None
        logging.error(f"Error processing document: {str(e)}")

    finally:
        job.save()


@shared_task
def process_video_task(video_job_id, script, mode):
    try:
        video_job = VideoProcessingJob.objects.get(job_id=video_job_id)
    except ObjectDoesNotExist:
        return {
            "status": "error",
            "job_id": str(video_job_id),
            "message": f"No VideoProcessingJob found with id {video_job_id}",
        }

    video_job.status = "processing"
    video_job.save()

    # Set up paths to save audio and video
    audio_output_file = os.path.join(
        settings.MEDIA_ROOT, "temp_asset", f"{video_job_id}.wav"
    )
    video_output_file = os.path.join(
        settings.MEDIA_ROOT, "generated_videos", f"{video_job_id}.mp4"
    )
    viseme_output_file = os.path.join(
        settings.MEDIA_ROOT, "temp_asset", f"{video_job_id}_viseme.json"
    )

    # Ensure the temp_asset directory exists
    os.makedirs(os.path.dirname(audio_output_file), exist_ok=True)

    try:
        generate_speech_and_viseme_from_text(
            script, audio_output_file, viseme_output_file, video_output_file
        )
        if mode == "fast":
            asyncio.run(
                generate_video_from_script_fast(
                    script=script,
                    audio_output_file=audio_output_file,
                    video_output_file=video_output_file,
                )
            )
        else:
            asyncio.run(
                generate_video_from_script(
                    script=script,
                    audio_output_file=audio_output_file,
                    video_output_file=video_output_file,
                )
            )

        if os.path.exists(video_output_file):
            video_job.status = "completed"
            video_job.video_preview = os.path.join("generated_videos", f"{video_job_id}.mp4")

    except Exception as e:
        video_job.status = "failed"
        logging.error(f"Error generating video: {str(e)}")

    finally:
        video_job.save()
