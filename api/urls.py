from django.urls import include, path
from . import views
from rest_framework.routers import DefaultRouter

from .views import (
    CustomAuthToken,
    FollowViewSet,
    GroupMessageViewSet,
    GroupPredictionViewSet,
    LogoutView,
    PredictionGroupViewSet,
    PredictionViewSet,
    RaceResultViewSet,
    RaceViewSet,
    SignUpView,
    UserPointViewSet,
    UserProfileViewSet,
)

router = DefaultRouter()
router.register("races", RaceViewSet, basename="race")
router.register("predictions", PredictionViewSet, basename="prediction")
router.register("follows", FollowViewSet, basename="follow")
router.register("profiles", UserProfileViewSet, basename="profile")
router.register("groups", PredictionGroupViewSet, basename="group")
router.register("group-predictions", GroupPredictionViewSet, basename="group-prediction")
router.register("group-messages", GroupMessageViewSet, basename="group-message")
router.register("race-results", RaceResultViewSet, basename="race-result")
router.register("user-points", UserPointViewSet, basename="user-point")

urlpatterns = [
    path("auth/signup/", SignUpView.as_view(), name="api-signup"),
    path("auth/login/", CustomAuthToken.as_view(), name="api-login"),
    path("auth/logout/", LogoutView.as_view(), name="api-logout"),
    path('users/me/profile/', views.user_profile, name='user-profile'),
    path("", include(router.urls)),
]

