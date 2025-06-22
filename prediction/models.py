from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver

# Create your models here.
class Race(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name

class Horse(models.Model):
    name = models.CharField(max_length=100)
    race = models.ForeignKey('Race', related_name='horses', on_delete=models.CASCADE)

    def __str__(self):
        return self.name

class Prediction(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    race = models.ForeignKey(Race, on_delete=models.CASCADE)
    first_position = models.ForeignKey(Horse, on_delete=models.CASCADE, related_name='first_predictions')
    second_position = models.ForeignKey(Horse, on_delete=models.CASCADE, related_name='second_predictions')
    third_position = models.ForeignKey(Horse, on_delete=models.CASCADE, related_name='third_predictions')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.race.name}: 1着 {self.first_position.name}, 2着 {self.second_position.name}, 3着 {self.third_position.name}"

class Follow(models.Model):
    follower = models.ForeignKey(User, related_name='following', on_delete=models.CASCADE)
    followed = models.ForeignKey(User, related_name='followers', on_delete=models.CASCADE)

    class Meta:
        unique_together = ('follower', 'followed')  # 同じ組み合わせは1回だけ

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    profile_image = models.ImageField(upload_to='profile_images/', blank=True, null=True)
    updated_at = models.DateTimeField(auto_now=True)  # ← これを追加！

    def __str__(self):
        return self.user.username

class PredictionGroup(models.Model):
    name = models.CharField(max_length=100, unique=True)
    members = models.ManyToManyField(User, related_name='prediction_groups')

    def __str__(self):
        return self.name
    
class GroupMessage(models.Model):
    group = models.ForeignKey(PredictionGroup, on_delete=models.CASCADE)
    sender = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

class GroupPrediction(models.Model):
    group = models.ForeignKey(PredictionGroup, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    race = models.ForeignKey(Race, on_delete=models.CASCADE)
    first_position = models.ForeignKey(Horse, on_delete=models.CASCADE, related_name='group_first_predictions')
    second_position = models.ForeignKey(Horse, on_delete=models.CASCADE, related_name='group_second_predictions')
    third_position = models.ForeignKey(Horse, on_delete=models.CASCADE, related_name='group_third_predictions')
    submitted_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.group.name} - {self.user.username} - {self.race.name}"

class RaceResult(models.Model):
    race = models.OneToOneField(Race, on_delete=models.CASCADE)
    first_place = models.ForeignKey(Horse, on_delete=models.SET_NULL, null=True, related_name='first_place_results')
    second_place = models.ForeignKey(Horse, on_delete=models.SET_NULL, null=True, related_name='second_place_results')
    third_place = models.ForeignKey(Horse, on_delete=models.SET_NULL, null=True, related_name='third_place_results')
    updated_at = models.DateTimeField(auto_now=True)  # ← これが必要

    def __str__(self):
        return f"{self.race.name} の結果"

class UserPoint(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    points = models.IntegerField(default=0)

    def __str__(self):
        return f"{self.user.username}: {self.points} pt"
