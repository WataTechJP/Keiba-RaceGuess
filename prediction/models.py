from django.db import models
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from django.db.models.signals import post_save
from django.dispatch import receiver

# Create your models here.
class Race(models.Model):
    name = models.CharField(max_length=100)
    date = models.DateTimeField(blank=True, null=True)
    location = models.CharField(max_length=100, blank=True, null=True)

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
    first_position = models.ForeignKey(Horse, on_delete=models.CASCADE, related_name='first_predictions', blank=True, null=True)
    second_position = models.ForeignKey(Horse, on_delete=models.CASCADE, related_name='second_predictions', blank=True, null=True)
    third_position = models.ForeignKey(Horse, on_delete=models.CASCADE, related_name='third_predictions', blank=True, null=True)
    comment = models.CharField(max_length=20, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def clean(self):
        # 3つ全部空はダメ（どれか1つは必須）
        if not (self.first_position_id or self.second_position_id or self.third_position_id):
            raise ValidationError("1着〜3着のうち、少なくとも1頭は選んでください。")

        # 選んだもの同士が重複してたらダメ（任意だけどおすすめ）
        picks = [p for p in [self.first_position_id, self.second_position_id, self.third_position_id] if p]
        if len(picks) != len(set(picks)):
            raise ValidationError("同じ馬を複数の着順に選べません。")
        
        # ★追加：馬がそのレースの馬かチェック（これが今回の解決）
        for horse in (self.first_position, self.second_position, self.third_position):
            if horse and horse.race_id != self.race_id:
                raise ValidationError("選んだ馬がレースと一致しません（別レースの馬です）。")

    def __str__(self):
        def nm(h): 
            return h.name if h else "-"
        return (
            f"{self.user.username} - {self.race.name}: "
            f"1着 {nm(self.first_position)}, 2着 {nm(self.second_position)}, 3着 {nm(self.third_position)}"
        )

class Follow(models.Model):
    follower = models.ForeignKey(User, related_name='following', on_delete=models.CASCADE)
    followed = models.ForeignKey(User, related_name='followers', on_delete=models.CASCADE)

    class Meta:
        unique_together = ('follower', 'followed')  # 同じ組み合わせは1回だけ

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    profile_image = models.ImageField(upload_to='profile_images/', blank=True, null=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.user.username

class PredictionGroup(models.Model):
    name = models.CharField(max_length=100, unique=True)
    owner = models.ForeignKey(User, related_name='owned_prediction_groups', on_delete=models.CASCADE, blank=True, null=True)
    members = models.ManyToManyField(User, related_name='prediction_groups')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name
    
class GroupMessage(models.Model):
    group = models.ForeignKey(PredictionGroup, on_delete=models.CASCADE, related_name="messages")
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name="group_messages")
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]

class GroupPrediction(models.Model):
    group = models.ForeignKey(PredictionGroup, on_delete=models.CASCADE, related_name="shared_predictions")
    prediction = models.ForeignKey(Prediction, on_delete=models.CASCADE, related_name="shared_to_groups", null=True, blank=True,)
    shared_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            # 同じ予想を同じグループに2回送れない
            models.UniqueConstraint(fields=["group", "prediction"], name="unique_group_prediction")
        ]
    
    def clean(self):
        p = self.prediction
        exists = GroupPrediction.objects.filter(
            group=self.group,
            prediction__user=p.user,
            prediction__race=p.race,
        ).exclude(pk=self.pk).exists()
        if exists:
            raise ValidationError("このグループにはこのレースの予想をすでに送信しています。")

    def __str__(self):
        return f"{self.group.name} - {self.prediction}"

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
    hit_rate = models.FloatField(default=0.0)

    def __str__(self):
        return f"{self.user.username}: {self.points} pt"

# グループが作成された瞬間にowner が自動で members に追加される
@receiver(post_save, sender=PredictionGroup)
def ensure_owner_in_members(sender, instance, **kwargs):
    if instance.owner_id and not instance.members.filter(id=instance.owner_id).exists():
        instance.members.add(instance.owner)
