from django.contrib import admin
from .models import DocumentProcessingJob, VideoProcessingJob


@admin.register(DocumentProcessingJob)
class DocumentProcessingJobAdmin(admin.ModelAdmin):
    list_display = ("job_id", "file", "status", "created_at")
    list_filter = ("status",)
    search_fields = ("job_id", "status")
    readonly_fields = ("job_id", "created_at")
    fieldsets = (
        (None, {"fields": ("job_id", "file", "status", "script", "created_at")}),
    )


@admin.register(VideoProcessingJob)
class VideoProcessingJobAdmin(admin.ModelAdmin):
    list_display = ("job_id", "document_job", "status", "generated_video", "created_at")
    list_filter = ("status", "document_job")
    search_fields = ("job_id", "status", "document_job__job_id")
    readonly_fields = ("job_id", "created_at")
    fieldsets = (
        (
            None,
            {
                "fields": (
                    "job_id",
                    "document_job",
                    "status",
                    "generated_video",
                    "created_at",
                )
            },
        ),
    )
