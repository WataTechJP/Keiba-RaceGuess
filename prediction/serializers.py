from django.contrib.auth.models import User
from rest_framework import serializers
from django.conf import settings

from prediction.models import (
    Follow,
    GroupMessage,
    GroupPrediction,
    Horse,
    Prediction,
    PredictionGroup,
    Race,
    RaceResult,
    UserPoint,
    UserProfile,
)


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "username", "email", "last_login", "date_joined")
        read_only_fields = ("id",)

class PasswordChangeSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True)
    new_password_confirm = serializers.CharField(write_only=True)

    def validate_old_password(self, value):
        user = self.context["request"].user
        if not user.check_password(value):
            raise serializers.ValidationError("現在のパスワードが正しくありません")
        return value

    def validate(self, data):
        if data["new_password"] != data["new_password_confirm"]:
            raise serializers.ValidationError("新しいパスワードが一致しません")
        return data

    def save(self, **kwargs):
        user = self.context["request"].user
        user.set_password(self.validated_data["new_password"])
        user.save()
        return user


class HorseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Horse
        fields = ("id", "name")
        read_only_fields = ("id",)


class RaceSerializer(serializers.ModelSerializer):
    horses = HorseSerializer(many=True, read_only=True)

    class Meta:
        model = Race
        fields = ("id", "name", "date", "location", "horses")


class PredictionSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    race = RaceSerializer(read_only=True)
    race_name = serializers.CharField(source="race.name", read_only=True)
    race_date = serializers.CharField(source="race.date", read_only=True)
    race_location = serializers.CharField(source="race.location", read_only=True)
    first_position_detail = HorseSerializer(source="first_position", read_only=True)
    second_position_detail = HorseSerializer(source="second_position", read_only=True)
    third_position_detail = HorseSerializer(source="third_position", read_only=True)
    comment = serializers.CharField(required=False, allow_blank=True, allow_null=True, max_length=20,)


    class Meta:
        model = Prediction
        fields = (
            "id",
            "race",
            "race_name",
            "race_date",
            "race_location",
            "first_position",
            "second_position",
            "third_position",
            "comment",
            "first_position_detail",
            "second_position_detail",
            "third_position_detail",
            "created_at",
            "user",
        )
        read_only_fields = ("id", "created_at", "user")


class TimelinePredictionSerializer(serializers.ModelSerializer):
    race_name = serializers.CharField(source="race.name", read_only=True)
    race_date = serializers.CharField(source="race.date", read_only=True)
    race_location = serializers.CharField(source="race.location", read_only=True)
    first_position_name = serializers.CharField(source="first_position.name", read_only=True)
    second_position_name = serializers.CharField(source="second_position.name", read_only=True)
    third_position_name = serializers.CharField(source="third_position.name", read_only=True)
    comment = serializers.CharField(required=False, allow_blank=True, allow_null=True, max_length=20)
    user = serializers.SerializerMethodField()

    class Meta:
        model = Prediction
        fields = (
            "id",
            "race_name",
            "race_date",
            "race_location",
            "first_position_name",
            "second_position_name",
            "third_position_name",
            "comment",
            "created_at",
            "user",
        )

    def get_user(self, obj):
        request = self.context.get("request")
        
        DEFAULT_PROFILE_IMAGE = "profile_images/default-image.jpg"

        if hasattr(obj.user, "userprofile") and obj.user.userprofile.profile_image:
            if request:
                profile_image_url = request.build_absolute_uri(
                    obj.user.userprofile.profile_image.url
                )
            else:
                profile_image_url = obj.user.userprofile.profile_image.url
        else:
            if request:
                profile_image_url = request.build_absolute_uri(
                    f"{settings.MEDIA_URL}{DEFAULT_PROFILE_IMAGE}"
                )
            else:
                profile_image_url = f"{settings.MEDIA_URL}{DEFAULT_PROFILE_IMAGE}"

        return {
            "username": obj.user.username,
            "profile_image_url": profile_image_url,
        }
