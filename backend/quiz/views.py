from django.http import HttpRequest
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from video_generator.models import DocumentProcessingJob
from .functionalities.quiz_generation import generate_quiz_questions


@api_view(["POST"])
def get_questions(request: HttpRequest, job_id):
    try:
        job = DocumentProcessingJob.objects.get(job_id=job_id)

        if not job.script:
            return Response(
                {"error": "No script found for this job."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        script_text = job.script

        # Generate quiz questions using the provided script text
        questions = generate_quiz_questions(script_text)

        # Return the generated questions as a JSON response
        return Response({"questions": questions}, status=200)

    except Exception as e:
        # Handle exceptions and return an error message
        return Response({"error": str(e)}, status=500)


@api_view(["POST"])
def publish_video_and_quiz(request: HttpRequest):
    pass