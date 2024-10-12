from django.db import models

class Video(models.Model):
    title = models.CharField(max_length=255)
    views = models.IntegerField(default=0)
    average_watch_time = models.DurationField()  # timedelta, e.g., 45 minutes
    completion_rate = models.FloatField(default=0.0)  # percentage (0-100)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

class Quiz(models.Model):
    video = models.ForeignKey(Video, on_delete=models.CASCADE, related_name="quizzes")
    title = models.CharField(max_length=255)
    average_score = models.FloatField(default=0.0)
    attempt_rate = models.FloatField(default=0.0)  # percentage (0-100)

    def __str__(self):
        return f"{self.title} (for {self.video.title})"

class Analytics(models.Model):
    total_videos_created = models.IntegerField(default=0)
    total_views = models.IntegerField(default=0)
    average_watch_time = models.DurationField()  # average watch time across videos
    average_completion_rate = models.FloatField(default=0.0)  # percentage (0-100)
    total_quiz_attempt_rate = models.FloatField(default=0.0)  # percentage (0-100)
    average_quiz_score = models.FloatField(default=0.0)

    def __str__(self):
        return "Platform Analytics"
