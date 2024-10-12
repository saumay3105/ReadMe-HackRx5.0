from django.db import models

from video_generator.models import Video


class Quiz(models.Model):
    quiz_id = models.AutoField(primary_key=True)
    video = models.ForeignKey(Video, on_delete=models.CASCADE)

    def __str__(self):
        return f"Quiz {self.quiz_id} for Video {self.video.title}"


class Question(models.Model):
    question_id = models.AutoField(primary_key=True)
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name="questions")
    question_text = models.TextField()
    correct_option = models.CharField(max_length=255)  # Storing the correct option text
    explanation = models.TextField()

    def __str__(self):
        return self.question_text


class Option(models.Model):
    option_id = models.AutoField(primary_key=True)
    question = models.ForeignKey(
        Question, on_delete=models.CASCADE, related_name="options"
    )
    option_text = models.CharField(max_length=255)

    def __str__(self):
        return self.option_text


# Result model to store quiz results
class Result(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    is_correct = models.BooleanField()
    time_taken = models.IntegerField()  # time in seconds
    points = models.IntegerField()
    streak = models.IntegerField()

    def __str__(self):
        return f"Result for Question {self.question.id}: {'Correct' if self.is_correct else 'Incorrect'}"
