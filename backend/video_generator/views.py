import logging
import os
import uuid
from django.http import FileResponse, HttpRequest
from django.conf import settings
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
import asyncio
from .functionalities.video_synthesis import (
    generate_speech_and_viseme_from_text,
    generate_video_from_script,
    generate_video_from_script_fast,
)
from .models import DocumentProcessingJob, VideoProcessingJob
from .tasks import generate_script_task, process_video_task


speed = ""


@api_view(["POST"])
def upload_document(request: HttpRequest):
    file = request.FILES.get("file")
    video_length = request.data.get("video_length")
    language = request.data.get("language")
    speed = request.data.get("processing_mode")
    # Validate input
    if not file or not file.name.endswith(".pdf"):
        return Response(
            {
                "status": "error",
                "message": "Invalid file format. Please provide a valid document. Accepted formats are pdf, docx, txt and md.",
            },
            status=status.HTTP_400_BAD_REQUEST,
        )
    SUPPORTED_LANGUAGES = [
        "English",
        "Hindi",
        "Tamil",
        "Telugu",
        "Kannada",
        "Malayalam",
        "Marathi",
        "Punjabi",
        "Urdu",
        "Gujrati",
    ]
    if language not in SUPPORTED_LANGUAGES:
        return Response(
            {
                "status": "error",
                "message": f"Invalid language selection. Supported languages: {', '.join(SUPPORTED_LANGUAGES)}",
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        # Create a unique job ID for this process
        job_id = uuid.uuid4()

        # Save the job details to the database (initial status: queued)
        job = DocumentProcessingJob.objects.create(
            job_id=job_id,
            file=file,
            status="queued",
            video_length=video_length,
            language=language,
            processing_mode = speed
        )

        # Trigger the Celery task asynchronously
        generate_script_task.delay(job.job_id, video_length, language,speed)

        return Response(
            {
                "status": "success",
                "message": "Document uploaded successfully. Processing started.",
                "job_id": job_id,
            },
            status=status.HTTP_202_ACCEPTED,
        )

    except Exception as e:
        logging.error(f"Error processing upload: {str(e)}")
        return Response(
            {
                "status": "error",
                "message": "An error occurred while processing the document.",
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["GET"])
def check_document_status(request: HttpRequest, job_id: uuid.UUID):
    try:
        # Find the job in the database using the job_id
        job = DocumentProcessingJob.objects.get(job_id=job_id)

        # Return the current status of the job
        return Response(
            {
                "status": "success",
                "job_id": job_id,
                "processing_status": job.status,
                "message": (
                    "Processing is still ongoing"
                    if job.status != "successful"
                    else "Processing completed successfully."
                ),
            },
            status=status.HTTP_200_OK,
        )

    except DocumentProcessingJob.DoesNotExist:
        return Response(
            {"status": "error", "message": "Job not found"},
            status=status.HTTP_404_NOT_FOUND,
        )

    except Exception as e:
        return Response(
            {"status": "error", "message": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["GET"])
def get_generated_script(request: HttpRequest, job_id: uuid.UUID):
    try:
        # Find the job and check if it is completed
        job = DocumentProcessingJob.objects.get(job_id=job_id)

        if job.status != "successful":
            return Response(
                {
                    "status": "error",
                    "message": "Document is still processing. Please try again later.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Return the extracted script (and other extracted content if needed)
        return Response(
            {
                "status": "success",
                "job_id": job_id,
                "extracted_script": job.script,
            },
            status=status.HTTP_200_OK,
        )

    except DocumentProcessingJob.DoesNotExist:
        return Response(
            {"status": "error", "message": "Job not found"},
            status=status.HTTP_404_NOT_FOUND,
        )

    except Exception as e:
        return Response(
            {"status": "error", "message": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["POST"])
def submit_script(request: HttpRequest, job_id):
    try:
        document_job = DocumentProcessingJob.objects.get(job_id=job_id)
        if document_job.status != "successful":
            return Response(
                {
                    "status": "error",
                    "message": "Invalid job status. Script is not generated yet.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # The user submits the modified script
        final_script = request.data.get("script")
        if not final_script:
            return Response(
                {"status": "error", "message": "No script provided."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        document_job.script = final_script
        document_job.save()

        video_job = VideoProcessingJob.objects.create(
            document_job=document_job, status="queued"
        )

        # Trigger background video generation process
        # process_video_task.delay(video_job.job_id, final_script)

        return Response(
            {
                "status": "success",
                "message": "Script submitted successfully. Video generation started.",
            },
            status=status.HTTP_202_ACCEPTED,
        )

    except DocumentProcessingJob.DoesNotExist:
        return Response(
            {"status": "error", "message": "No Job found for the given ID."},
            status=status.HTTP_404_NOT_FOUND,
        )


@api_view(["GET"])
def generate_video(request, job_id):
    try:
        # Fetch the job using the provided job_id
        job = DocumentProcessingJob.objects.get(job_id=job_id)

        if not job.script:
            return Response(
                {"error": "No script found for this job."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Set up paths to save audio and video
        audio_output_file = os.path.join(
            settings.MEDIA_ROOT, "temp_asset", f"{job_id}.wav"
        )
        video_output_file = os.path.join(
            settings.MEDIA_ROOT, "generated_videos", f"{job_id}.mp4"
        )
        viseme_output_file = os.path.join(
            settings.MEDIA_ROOT, "temp_asset", f"{job_id}_viseme.json"
        )

        # Ensure the temp_asset directory exists
        os.makedirs(os.path.dirname(audio_output_file), exist_ok=True)

        # Generate speech and viseme data
        viseme_data = generate_speech_and_viseme_from_text(
            job.script, audio_output_file, viseme_output_file, video_output_file
        )
        if job.processing_mode == "fast":
            asyncio.run(
                generate_video_from_script_fast(
                    script=job.script,
                    audio_output_file=audio_output_file,
                    video_output_file=video_output_file,
                )
            )
        else:
            asyncio.run(
                generate_video_from_script(
                    script=job.script,
                    audio_output_file=audio_output_file,
                    video_output_file=video_output_file,
                )
            )

        # Return the audio file as a response
        if os.path.exists(video_output_file):
            return FileResponse(open(video_output_file, "rb"), content_type="video/mp4")

        return Response(
            {"error": "Failed to generate video."},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    except DocumentProcessingJob.DoesNotExist:
        return Response({"error": "Job not found."}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        print(e)
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
