from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('get_horses/', views.get_horses, name='get_horses'),  # 👈 追加
    # 他のURLパターン...
]
