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

class Group(models.Model):
    name = models.CharField(max_length=100)
    members = models.ManyToManyField(User, related_name='groups')

    def __str__(self):
        return self.name
