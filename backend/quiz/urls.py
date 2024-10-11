from django.urls import path
from .views import get_questions, save_results

urlpatterns = [
    path("generate-questions/<uuid:job_id>/", get_questions, name="get_questions"),
    path('api/results/', save_results, name='save_results'),
]
