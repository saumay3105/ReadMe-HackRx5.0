import logging
import os
import uuid
from datetime import timedelta
import json

from django.conf import settings
from django.http import HttpRequest
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .functionalities.video_synthesis import generate_thumbnail, generate_video_details
from moviepy.editor import VideoFileClip
from .models import DocumentProcessingJob, VideoProcessingJob, Video
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
            processing_mode=speed,
        )

        # Trigger the Celery task asynchronously
        generate_script_task.delay(job.job_id, video_length, language, speed)

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
def generate_video(request: HttpRequest, document_job_id):
    try:
        # Fetch the job using the provided job_id
        document_job = DocumentProcessingJob.objects.get(job_id=document_job_id)

        if not document_job.script:
            return Response(
                {"error": "No script found for this job."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Create a unique job ID for the vidoe processing
        video_job_id = uuid.uuid4()

        # Save the job details to the database (initial status: queued)
        video_job = VideoProcessingJob.objects.create(
            job_id=video_job_id,
            document_job=document_job,
            video_preview=None,
            status="queue",
        )

        process_video_task.delay(
            video_job.job_id, document_job.script, document_job.processing_mode
        )

        return Response(
            {
                "status": "success",
                "message": "Video generation started.",
                "video_job_id": video_job.job_id,
            },
            status=status.HTTP_202_ACCEPTED,
        )

    except DocumentProcessingJob.DoesNotExist:
        return Response({"error": "Job not found."}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logging.error(f"An error occurred while generating the video: {e}")
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["GET"])
def check_video_status(request, video_job_id):
    try:
        video_job = VideoProcessingJob.objects.get(job_id=video_job_id)

        if video_job.status == "completed":
            document_job = video_job.document_job
            try:
                video_details = generate_video_details(document_job)
                video_details = json.loads(video_details)
            except Exception as e:
                video_details = {}

            return Response(
                {
                    "status": video_job.status,
                    "title": video_details.get("title", ""),
                    "description": video_details.get("description", ""),
                    "language": document_job.language,
                    "date_created": document_job.created_at,
                    "video_url": request.build_absolute_uri(
                        video_job.video_preview.url
                    ),
                },
                status=status.HTTP_200_OK,
            )
        else:
            return Response({"status": video_job.status}, status=status.HTTP_200_OK)

    except VideoProcessingJob.DoesNotExist:
        return Response({"error": "Job not found."}, status=status.HTTP_404_NOT_FOUND)


@api_view(["POST"])
def publish_video(request, video_job_id):
    try:
        # Fetch the video processing job
        video_job = VideoProcessingJob.objects.get(job_id=video_job_id)

        if video_job.status != "completed" or not video_job.video_preview:
            return Response(
                {"error": "Video has not been processed or preview is not available."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        video_file_path = video_job.video_preview.path
        video_clip = VideoFileClip(video_file_path)
        video_duration = video_clip.duration

        thumbnail_output = os.path.join(
            settings.MEDIA_ROOT, "thumbnails", f"{video_job_id}.jpg"
        )
        os.makedirs(os.path.dirname(thumbnail_output), exist_ok=True)

        # Create video instance with video duration and thumbnail
        generate_thumbnail(video_clip, video_duration, thumbnail_output)

        # Create a new Video object and mark as published
        video = Video.objects.create(
            video_job=video_job,
            title=request.data.get("title", "Untitled Video"),
            description=request.data.get("description", ""),
            video_file=video_job.video_preview,  # Use the preview video as final
            duration=timedelta(seconds=video_duration),
            thumbnail=thumbnail_output,
            published=True,
        )

        return Response(
            {
                "status": "success",
                "message": "Video published successfully.",
                "video_id": str(video.video_id),
            },
            status=status.HTTP_201_CREATED,
        )

    except VideoProcessingJob.DoesNotExist:
        return Response(
            {"error": "Video job not found."}, status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        logging.error(f"Error publishing video: {e}")
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["GET"])
def get_published_video(request, video_id):
    try:
        video = Video.objects.get(video_id=video_id, published=True)

        video_data = {
            "video_id": str(video.video_id),  # Ensure UUID is converted to string
            "title": video.title,
            "description": video.description,
            "video_file": str(video.video_file.url),  # Convert to string
            "thumbnail": (
                str(video.thumbnail.url) if video.thumbnail else None
            ),  # Handle thumbnail as URL or None
            "duration": video.duration.total_seconds(),  # Convert timedelta to seconds
            "created_at": video.created_at.isoformat(),  # Ensure datetime is serialized as ISO format
        }

        return Response({"video": video_data}, status=status.HTTP_200_OK)

    except Video.DoesNotExist:
        return Response(
            {"error": "Video not found or is not published."},
            status=status.HTTP_404_NOT_FOUND,
        )
    except Exception as e:
        logging.error(f"Error fetching video: {e}")
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["GET"])
def get_all_published_videos(request):
    try:
        # Get all published videos
        videos = Video.objects.filter(published=True)

        # Create a list of video data dictionaries
        videos_data = [
<<<<<<< HEAD
        {
            "video_id": str(video.video_id),  # Ensure UUID is converted to string
            "title": video.title,
            "description": video.description,
            "video_file": str(video.video_file.url),  # Convert to string
            "thumbnail": str(video.thumbnail.url) if video.thumbnail else None,  # Handle thumbnail as URL or None
            "duration": video.duration.total_seconds(),  # Convert timedelta to seconds
            "created_at": video.created_at.isoformat(),  # Ensure datetime is serialized as ISO format
        }
=======
            {
                "video_id": str(video.video_id),  # Ensure UUID is converted to string
                "title": video.title,
                "description": video.description,
                "video_file": str(video.video_file.url),  # Convert to string
                "thumbnail": (
                    str(video.thumbnail.url) if video.thumbnail else None
                ),  # Handle thumbnail as URL or None
                "duration": video.duration.total_seconds(),  # Convert timedelta to seconds
                "created_at": video.created_at.isoformat(),  # Ensure datetime is serialized as ISO format
            }
>>>>>>> e5acb7581d063c792e5b4038b5cbd2d1742dc314
            for video in videos
        ]

        return Response({"videos": videos_data}, status=status.HTTP_200_OK)

    except Exception as e:
        logging.error(f"Error fetching videos: {e}")
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
