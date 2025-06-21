from django.urls import path
from . import views

urlpatterns = [
    path('get_horses/', views.get_horses, name='get_horses'),  # 👈 追加
    # 他のURLパターン...
]
