from django.urls import path
from . import views

urlpatterns = [
    path('video-stats/', views.video_stats, name='video_stats'),
    path('quiz-stats/', views.quiz_stats, name='quiz_stats'),
    path('analytics-overview/', views.analytics_overview, name='analytics_overview'),
]
