from django.http import HttpRequest, JsonResponse
from rest_framework.decorators import api_view
from .functionalities.quiz_generation import generate_quiz_questions


@api_view(["POST"])
def get_questions(request: HttpRequest):
    try:
        # Extract the script text from the POST request body (assumes JSON format)
        script_text = request.data.get("script_text")

        if not script_text:
            return JsonResponse({"error": "No script text provided."}, status=400)

        # Generate quiz questions using the provided script text
        questions = generate_quiz_questions(script_text)

        # Return the generated questions as a JSON response
        return JsonResponse({"questions": questions}, status=200)

    except Exception as e:
        # Handle exceptions and return an error message
        return JsonResponse({"error": str(e)}, status=500)
