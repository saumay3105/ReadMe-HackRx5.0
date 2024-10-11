from django.contrib import admin
from .models import DocumentProcessingJob, VideoProcessingJob, Video


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
    list_display = ("job_id", "document_job", "status", "video_preview", "created_at")
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
                    "video_preview",
                    "created_at",
                )
            },
        ),
    )
class VideoAdmin(admin.ModelAdmin):
    list_display = ('video_id', 'title', 'created_at', 'published', 'duration')  # Fields to display in the list view
    search_fields = ('title', 'description')  # Fields to enable search
    list_filter = ('published', 'created_at')  # Filters to enable filtering options
    ordering = ('-created_at',)  # Default ordering


admin.site.register(Video, VideoAdmin)
