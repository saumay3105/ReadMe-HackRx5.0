from django.urls import path
from . import views

urlpatterns = [path("generate-questions/", views.get_questions, name="get_questions")]
