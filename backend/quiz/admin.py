from django.contrib import admin
from .models import Video, Quiz, Question, Option, Result

admin.site.register(Video)
admin.site.register(Quiz)
admin.site.register(Question)
admin.site.register(Option)
admin.site.register(Result)
