import uuid
from django.db import models


class DocumentProcessingJob(models.Model):
    job_id = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    file = models.FileField(upload_to="uploaded_documents/")
    status = models.CharField(
        max_length=50,
        choices=[
            ("queued", "Queued"),
            ("processing", "Processing"),
            ("successful", "successful"),
            ("failed", "Failed"),
        ],
    )
    script = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)


class VideoProcessingJob(models.Model):
    job_id = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    document_job = models.ForeignKey(DocumentProcessingJob, on_delete=models.CASCADE)
    status = models.CharField(
        max_length=50,
        choices=[
            ("queued", "Queued"),
            ("processing", "Processing"),
            ("completed", "Completed"),
            ("failed", "Failed"),
        ],
    )
    generated_video = models.FileField(
        upload_to="generated_videos/", null=True, blank=True
    )
    created_at = models.DateTimeField(auto_now_add=True)
