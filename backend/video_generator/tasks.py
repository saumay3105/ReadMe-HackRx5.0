import uuid
from celery import shared_task

from .models import DocumentProcessingJob, VideoProcessingJob
from .functionalities.text_processing import (
    extract_text,
    generate_script,
    get_prompts_from_script,
)
from .functionalities.image_generation import generate_images
from .functionalities.video_synthesis import synthesize_video


@shared_task
def generate_script_task(job_id: uuid.UUID):
    job = DocumentProcessingJob.objects.get(job_id=job_id)
    job.status = "processing"
    job.save()

    try:
        file_path = job.file.path
        text = extract_text(file_path)
        script = generate_script(text)

        # Update job status to 'successful' and save the generated script
        job.status = "successful"
        job.generated_script = script
    except Exception as e:
        job.status = "failed"
        job.generated_script = None
        print(f"Error processing document: {str(e)}")

    finally:
        job.save()


@shared_task
def process_video_task(job_id, script):
    job = VideoProcessingJob.objects.get(job_id=job_id)
    job.status = "processing"
    job.save()

    try:
        # Step 1: Generate image from the prompt
        prompts = get_prompts_from_script(script)  # Assuming you have this function
        images = generate_images(prompts)

        # Step 2: Synthesize video based on script and generated images
        video = synthesize_video(script, images)

        job.status = "completed"
        job.generated_video = video
        job.save()

    except Exception as e:
        job.status = "failed"
        job.save()
        print(f"Error generating video: {str(e)}")

    return job
