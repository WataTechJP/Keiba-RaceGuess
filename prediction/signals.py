# prediction/signals.py

from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import User
from .models import UserProfile
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import RaceResult, Prediction, UserPoint

@receiver(post_save, sender=User)
def create_or_update_user_profile(sender, instance, created, **kwargs):
    # 存在しなければ作成、あれば取得
    profile, _ = UserProfile.objects.get_or_create(user=instance)
    profile.save()
    
@receiver(post_save, sender=RaceResult)
def update_user_points_and_hit_rate(sender, instance, created, **kwargs):
    """レース結果が作成されたら、全ユーザーのポイントと的中率を更新"""
    if created:
        race = instance.race
        predictions = Prediction.objects.filter(race=race)
        
        for prediction in predictions:
            user = prediction.user
            points_earned = 0
            
            # ポイント計算
            if prediction.first_position == instance.first_place:
                points_earned += 3
            if prediction.second_position == instance.second_place:
                points_earned += 2
            if prediction.third_position == instance.third_place:
                points_earned += 1
            
            # UserPointを更新
            user_point, created = UserPoint.objects.get_or_create(user=user)
            user_point.points += points_earned
            
            # ✅ 的中率を再計算
            from api.views import calculate_hit_rate
            user_point.hit_rate = calculate_hit_rate(user)
            
            user_point.save()
