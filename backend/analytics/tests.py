from django.test import TestCase
from rest_framework.test import APIClient
from analytics.models import Video, Quiz, Analytics
from datetime import timedelta

class AnalyticsAppTests(TestCase):

    def setUp(self):
        # Set up initial data for models
        self.video = Video.objects.create(
            title="Life Insurance",
            views=300,
            average_watch_time=timedelta(minutes=45),
            completion_rate=80.0
        )
        self.quiz = Quiz.objects.create(
            video=self.video,
            title="Life Insurance Quiz",
            average_score=4.2,
            attempt_rate=75.0
        )
        self.analytics = Analytics.objects.create(
            total_videos_created=23,
            total_views=1003,
            average_watch_time=timedelta(minutes=45),
            average_completion_rate=83.0,
            total_quiz_attempt_rate=75.0,
            average_quiz_score=6.3
        )
        self.client = APIClient()

    # Model Tests
    def test_video_creation(self):
        """Test that the Video model is created correctly"""
        self.assertEqual(self.video.title, "Life Insurance")
        self.assertEqual(self.video.views, 300)
        self.assertEqual(self.video.average_watch_time, timedelta(minutes=45))
        self.assertEqual(self.video.completion_rate, 80.0)

    def test_quiz_creation(self):
        """Test that the Quiz model is created correctly"""
        self.assertEqual(self.quiz.title, "Life Insurance Quiz")
        self.assertEqual(self.quiz.video.title, "Life Insurance")
        self.assertEqual(self.quiz.average_score, 4.2)
        self.assertEqual(self.quiz.attempt_rate, 75.0)

    def test_analytics_creation(self):
        """Test that the Analytics model is created correctly"""
        self.assertEqual(self.analytics.total_videos_created, 23)
        self.assertEqual(self.analytics.total_views, 1003)
        self.assertEqual(self.analytics.average_watch_time, timedelta(minutes=45))
        self.assertEqual(self.analytics.average_completion_rate, 83.0)
        self.assertEqual(self.analytics.total_quiz_attempt_rate, 75.0)
        self.assertEqual(self.analytics.average_quiz_score, 6.3)

    # View Tests
    def test_video_stats_view(self):
        """Test video stats API endpoint"""
        response = self.client.get('/analytics/video-stats/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()['videos']), 1)
        self.assertEqual(response.json()['videos'][0]['title'], "Life Insurance")
        self.assertEqual(response.json()['videos'][0]['views'], 300)

    def test_quiz_stats_view(self):
        """Test quiz stats API endpoint"""
        response = self.client.get('/analytics/quiz-stats/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()['quizzes']), 1)
        self.assertEqual(response.json()['quizzes'][0]['quiz_title'], "Life Insurance Quiz")
        self.assertEqual(response.json()['quizzes'][0]['average_score'], 4.2)

    def test_analytics_overview_view(self):
        """Test analytics overview API endpoint"""
        response = self.client.get('/analytics/analytics-overview/')
        self.assertEqual(response.status_code, 200)
        data = response.json()['analytics']
        self.assertEqual(data['total_videos_created'], 23)
        self.assertEqual(data['total_views'], 1003)
        self.assertEqual(data['average_completion_rate'], 83.0)
        self.assertEqual(data['total_quiz_attempt_rate'], 75.0)
        self.assertEqual(data['average_quiz_score'], 6.3)
