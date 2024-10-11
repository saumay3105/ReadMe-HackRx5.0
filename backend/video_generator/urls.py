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
    path(
        "submit-script/<uuid:job_id>/",
        views.submit_script,
        name="submit_script",
    ),
    path(
        "generate-video/<uuid:document_job_id>/",
        views.generate_video,
        name="generate-video",
    ),
    path(
        "video-status/<uuid:video_job_id>/",
        views.check_video_status,
        name="check-video-status",
    ),
    path(
        "publish-video/<uuid:video_job_id>/",
        views.publish_video,
        name="publish-video",
    ),
    path(
        "video/all/",
        views.get_all_published_videos,
        name="get-all-videos"
    ),
    path(
        "videos/<uuid:video_id>/",
        views.get_published_video,
        name="get-video"
    ),
]
