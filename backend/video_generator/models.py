from datetime import datetime
import os
import uuid
from django.db import models


def upload_to_unique_filename(instance, filename):
    # Get the file name and extension
    base_filename, extension = os.path.splitext(filename)

    # Get the current timestamp as a string
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")

    # Combine the original filename with the timestamp and the extension
    unique_filename = f"{base_filename}_{timestamp}{extension}"

    # Save the file in the 'uploaded_documents/' folder
    return os.path.join("uploaded_documents", unique_filename)


class DocumentProcessingJob(models.Model):
    job_id = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    file = models.FileField(upload_to=upload_to_unique_filename)
    status = models.CharField(
        max_length=50,
        choices=[
            ("queued", "Queued"),
            ("processing", "Processing"),
            ("successful", "Successful"),
            ("failed", "Failed"),
        ],
    )
    script = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    video_length = models.IntegerField(default=60) 
    language = models.TextField(null=True, blank=True)

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
    video_length = models.IntegerField(default=60)  # Optional: track video length here as well

    def to_dict(self):
        return {
            "id": str(self.id),
            "job_id": str(self.job_id),
            "status": self.status,
            "generated_video": (
                str(self.generated_video) if self.generated_video else None
            ),
            "video_length": self.video_length,  # Include video length in dict output if needed
        }

class Video(models.Model):
    video_id = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    document_job = models.ForeignKey(DocumentProcessingJob, on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    video_file = models.FileField(upload_to='generated_videos/')
    duration = models.DurationField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    published = models.BooleanField(default=False)

    def __str__(self):
        return self.title
