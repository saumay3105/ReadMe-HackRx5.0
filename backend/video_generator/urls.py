from django.urls import path
from . import views

urlpatterns = [
    path("upload-document/", views.upload_document, name="upload_document"),
    path(
        "document-status/<uuid:job_id>/",
        views.check_document_status,
        name="check_document_status",
    ),
    path(
        "get-script/<uuid:job_id>/",
        views.get_generated_script,
        name="get_generated_script",
    ),
]
