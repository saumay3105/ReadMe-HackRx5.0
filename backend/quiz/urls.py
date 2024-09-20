from django.urls import path
from . import views

urlpatterns = [
    path("generate-questions/<uuid:job_id>/", views.get_questions, name="get_questions")
]
