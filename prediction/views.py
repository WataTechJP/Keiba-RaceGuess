from django.shortcuts import render, redirect, get_object_or_404
from django.http import JsonResponse, HttpResponseForbidden
from django.contrib.auth.decorators import login_required
from .forms import PredictionForm
from .models import Prediction, Horse, Race, Follow
from django.contrib.auth.models import User, Group
from django.contrib.auth import login
from .forms import SignUpForm


def home(request):
    return render(request, 'home.html')


@login_required
def submit_prediction(request):
    if request.method == 'POST':
        form = PredictionForm(request.POST)
        if form.is_valid():
            prediction = form.save(commit=False)
            prediction.user = request.user
            prediction.save()
            return redirect('prediction_list')
    else:
        form = PredictionForm()
    return render(request, 'submit.html', {'form': form})


@login_required
def prediction_list(request):
    predictions = Prediction.objects.filter(user=request.user).order_by('-created_at')
    return render(request, 'list.html', {'predictions': predictions})

@login_required
def delete_prediction(request, pk):
    prediction = get_object_or_404(Prediction, pk=pk)
    if prediction.user != request.user:
        return HttpResponseForbidden("自分の予想しか削除できません。")
    prediction.delete()
    return redirect('prediction_list')


def get_horses_by_race(request):
    race_id = request.GET.get('race_id')
    if race_id:
        horses = Horse.objects.filter(race_id=race_id).values('id', 'name')
        return JsonResponse(list(horses), safe=False)
    return JsonResponse([], safe=False)

@login_required
def user_list(request):
    users = User.objects.exclude(id=request.user.id)
    followed_users = request.user.following.values_list('followed_id', flat=True)
    return render(request, "user_list.html", {
        "users": users,
        "followed_users": followed_users,
    })
    
@login_required
def group_list(request):
    groups = Group.objects.all()
    return render(request, "group_list.html", {"groups": groups})

@login_required
def follow_user(request, user_id):
    target = get_object_or_404(User, id=user_id)
    if target != request.user:
        Follow.objects.get_or_create(follower=request.user, followed=target)
    return redirect("user_list")

@login_required
def unfollow_user(request, user_id):
    Follow.objects.filter(follower=request.user, followed__id=user_id).delete()
    return redirect("user_list")

@login_required
def timeline(request):
    selected_race_id = request.GET.get("race_id")

    # フォロー中のユーザーと自分自身を対象にする
    following_users = list(
        request.user.following.values_list("followed", flat=True)
    ) + [request.user.id]

    predictions = Prediction.objects.filter(user__id__in=following_users)

    # レースIDでフィルタリング（必要に応じて）
    if selected_race_id:
        predictions = predictions.filter(race_id=selected_race_id)

    predictions = predictions.order_by("-created_at")
    races = Race.objects.all()

    return render(
        request,
        "timeline.html",
        {
            "predictions": predictions,
            "races": races,
            "selected_race_id": int(selected_race_id) if selected_race_id else None,
        },
    )

def signup(request):
    if request.method == "POST":
        form = SignUpForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)  # 登録後すぐログイン
            return redirect("submit_prediction")
    else:
        form = SignUpForm()
    return render(request, "signup.html", {"form": form})

from .forms import UserProfileForm
from .models import UserProfile

@login_required
def profile(request):
    profile = request.user.userprofile
    if request.method == 'POST':
        form = UserProfileForm(request.POST, request.FILES, instance=profile)
        if form.is_valid():
            form.save()
            return redirect('profile')
    else:
        form = UserProfileForm(instance=profile)
    return render(request, 'profile.html', {'form': form, 'profile': profile})
