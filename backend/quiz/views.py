from django.http import HttpRequest, JsonResponse
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from video_generator.models import DocumentProcessingJob
from .models import Quiz, Question, Result
from .serializers import QuizSerializer, QuestionSerializer, ResultSerializer, CreateResultSerializer
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
        return JsonResponse({"questions": questions}, status=200)

    except DocumentProcessingJob.DoesNotExist:
        return Response({"error": "Job not found."}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(["POST"])
def save_results(request: HttpRequest):
    serializer = CreateResultSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()  # Save the result to the database
        return Response(serializer.data, status=status.HTTP_201_CREATED)  # Return the created result
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)  # Return errors if invalid data

@api_view(["GET"])
def fetch_quiz(request, quiz_id):
    try:
        quiz = Quiz.objects.get(quiz_id=quiz_id)
        serializer = QuizSerializer(quiz)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Quiz.DoesNotExist:
        return Response({"error": "Quiz not found."}, status=status.HTTP_404_NOT_FOUND)

@api_view(["GET"])
def fetch_questions(request, quiz_id):
    try:
        questions = Question.objects.filter(quiz__quiz_id=quiz_id)
        serializer = QuestionSerializer(questions, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
