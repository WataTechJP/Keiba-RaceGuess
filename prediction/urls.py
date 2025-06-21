from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from . import views
from .views import get_horses_by_race, delete_prediction, signup, profile

urlpatterns = [
    path('submit/', views.submit_prediction, name='submit_prediction'),
    path('predictions/', views.prediction_list, name='prediction_list'),
    path('api/horses/', get_horses_by_race, name='get_horses_by_race'),
    path('accounts/', include('django.contrib.auth.urls')),
    path('delete/<int:pk>/', delete_prediction, name='delete_prediction'),
    path('users/', views.user_list, name='user_list'),
    path('follow/<int:user_id>/', views.follow_user, name='follow_user'),
    path('unfollow/<int:user_id>/', views.unfollow_user, name='unfollow_user'),
    path('timeline/', views.timeline, name='timeline'),
    path('signup/', signup, name='signup'),
    path('profile/', profile, name='profile'),
    path('groups/', views.group_list, name='group_list'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
