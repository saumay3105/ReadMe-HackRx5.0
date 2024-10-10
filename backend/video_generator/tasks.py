import uuid
from django.core.exceptions import ObjectDoesNotExist
from celery import shared_task

from .models import DocumentProcessingJob, VideoProcessingJob
from .functionalities.text_processing import (
    extract_text,
    generate_script,
    get_prompts_from_script,
)
from .functionalities.video_synthesis import generate_video_from_script


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
        print(f"Error processing document: {str(e)}")

    finally:
        job.save()


@shared_task
def process_video_task(job_id, script):
    try:
        job = VideoProcessingJob.objects.get(job_id=job_id)
    except ObjectDoesNotExist:
        return {
            "status": "error",
            "job_id": str(job_id),
            "message": f"No VideoProcessingJob found with id {job_id}",
        }

    job.status = "processing"
    job.save()

    try:
        prompts = get_prompts_from_script(script)
        images = generate_images(prompts)
        # video = generate_video_from_script(script, images)

        job.status = "completed"
        job.generated_video = video
        job.save()

        return job.to_dict()

    except Exception as e:
        job.status = "failed"
        job.save()
        print(f"Error generating video: {str(e)}")

        return {
            "status": "error",
            "job_id": str(job_id),
            "message": f"Error generating video: {str(e)}",
        }
