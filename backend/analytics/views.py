from django.shortcuts import render
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from .models import Video, Quiz, Analytics

def video_stats(request):
    videos = Video.objects.all()
    data = [{
        "title": video.title,
        "views": video.views,
        "average_watch_time": video.average_watch_time,
        "completion_rate": video.completion_rate,
    } for video in videos]
    return JsonResponse({"videos": data})

def quiz_stats(request):
    quizzes = Quiz.objects.all()
    data = [{
        "video_title": quiz.video.title,
        "quiz_title": quiz.title,
        "average_score": quiz.average_score,
        "attempt_rate": quiz.attempt_rate,
    } for quiz in quizzes]
    return JsonResponse({"quizzes": data})

def analytics_overview(request):
    analytics = Analytics.objects.first()
    data = {
        "total_videos_created": analytics.total_videos_created,
        "total_views": analytics.total_views,
        "average_watch_time": analytics.average_watch_time,
        "average_completion_rate": analytics.average_completion_rate,
        "total_quiz_attempt_rate": analytics.total_quiz_attempt_rate,
        "average_quiz_score": analytics.average_quiz_score,
    }
    return JsonResponse({"analytics": data})
