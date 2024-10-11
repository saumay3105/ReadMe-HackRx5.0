from rest_framework import serializers
from .models import Video, Quiz, Question, Option, Result

# Serializer for the Video model
class VideoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Video
        fields = ['video_id', 'title']  # Adjust fields as needed

# Serializer for the Quiz model
class QuizSerializer(serializers.ModelSerializer):
    video = VideoSerializer(read_only=True)  # Including related video details

    class Meta:
        model = Quiz
        fields = ['quiz_id', 'video']  # Fields for quiz, related to video

# Serializer for the Option model
class OptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Option
        fields = ['option_id', 'question', 'option_text']  # Adjust fields as needed

# Serializer for the Question model
class QuestionSerializer(serializers.ModelSerializer):
    options = OptionSerializer(many=True, read_only=True)  # Nested options for the question

    class Meta:
        model = Question
        fields = ['question_id', 'quiz', 'question_text', 'correct_option', 'explanation', 'options']  # Fields for question with nested options

# Serializer for the Result model
class ResultSerializer(serializers.ModelSerializer):
    question = QuestionSerializer(read_only=True)  # Nested question details in result

    class Meta:
        model = Result
        fields = ['question', 'is_correct', 'time_taken', 'points', 'streak']  # Fields for result

# For posting a result with only the question ID
class CreateResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = Result
        fields = ['question', 'is_correct', 'time_taken', 'points', 'streak']  # Fields for creating a result
