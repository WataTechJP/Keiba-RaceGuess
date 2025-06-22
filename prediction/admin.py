from django.contrib import admin
from .models import Prediction, PredictionGroup, RaceResult

@admin.register(RaceResult)
class RaceResultAdmin(admin.ModelAdmin):
    list_display = ('race', 'first_place', 'second_place', 'third_place', 'updated_at')

admin.site.register(Prediction)
admin.site.register(PredictionGroup)
