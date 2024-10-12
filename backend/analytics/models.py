from django.db import models

class Video(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    video_file = models.FileField(upload_to='videos/')
    likes = models.IntegerField(default=0)
    total_views = models.IntegerField(default=0)
    rating = models.FloatField(default=0.0)  # Average rating

    def __str__(self):
        return self.title
