import logging
import uuid
from django.http import HttpRequest
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from .models import DocumentProcessingJob, VideoProcessingJob
from .tasks import generate_script_task, process_video_task


@api_view(["POST"])
def upload_document(request: HttpRequest):
    file = request.FILES.get("file")

    if not file or not file.name.endswith(".pdf"):
        return Response(
            {
                "status": "error",
                "message": "Invalid file format. Please provide the document in PDF format.",
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        # Create a unique job ID for this process
        job_id = uuid.uuid4()

        # Save the job details to the database (initial status: queued)
        job = DocumentProcessingJob.objects.create(
            job_id=job_id, file=file, status="queued"
        )

        # Trigger the Celery task asynchronously
        generate_script_task.delay(job.job_id)

        return Response(
            {
                "status": "success",
                "message": "Document uploaded successfully. Processing started.",
                "job_id": job_id,
            },
            status=status.HTTP_202_ACCEPTED,
        )

    except Exception as e:
        logging.error(e)
        return Response(
            {"status": "error", "message": str(e)},
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
def submit_script(request: HttpRequest, document_job_id):
    try:
        document_job = DocumentProcessingJob.objects.get(job_id=document_job_id)
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
        process_video_task.delay(video_job.job_id, final_script)

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
