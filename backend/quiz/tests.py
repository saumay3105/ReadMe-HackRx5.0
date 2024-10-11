from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from .models import Video, Quiz, Question, Option, Result

class QuizAPITestCase(APITestCase):
    def setUp(self):
        # Set up initial data for testing
        self.video = Video.objects.create(video_id=1, title="Test Video")
        self.quiz = Quiz.objects.create(quiz_id=1, video=self.video)

        self.question = Question.objects.create(
            question_id=1,
            quiz=self.quiz,
            question_text="What is the capital of India?",
            correct_option="New Delhi",
            explanation="The capital of India is New Delhi."
        )

        self.option1 = Option.objects.create(option_id=1, question=self.question, option_text="New Delhi")
        self.option2 = Option.objects.create(option_id=2, question=self.question, option_text="Mumbai")

        self.result_data = {
            'question': self.question.id,
            'is_correct': True,
            'time_taken': 30,
            'points': 10,
            'streak': 1
        }

    def test_fetch_quiz(self):
        """Test fetching a quiz by ID."""
        url = reverse('fetch_quiz', args=[self.quiz.quiz_id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['quiz_id'], self.quiz.quiz_id)

    def test_fetch_questions(self):
        """Test fetching questions for a quiz."""
        url = reverse('fetch_questions', args=[self.quiz.quiz_id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)  # Expecting one question

    def test_save_result(self):
        """Test saving a result."""
        url = reverse('save_results')
        response = self.client.post(url, data=self.result_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Result.objects.count(), 1)
        self.assertEqual(Result.objects.get().is_correct, True)

    def test_get_questions_invalid_quiz(self):
        """Test fetching questions for an invalid quiz ID."""
        url = reverse('fetch_questions', args=[999])  # Non-existent quiz ID
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_save_result_invalid_data(self):
        """Test saving result with invalid data."""
        url = reverse('save_results')
        invalid_data = {
            'question': None,  # Missing question
            'is_correct': True,
            'time_taken': 30,
            'points': 10,
            'streak': 1
        }
        response = self.client.post(url, data=invalid_data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

