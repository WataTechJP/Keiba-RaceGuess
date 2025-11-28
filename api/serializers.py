from django.contrib.auth.models import User
from rest_framework import serializers

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
        fields = ("id", "username", "email")
        read_only_fields = ("id",)


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ("id", "username", "email", "password")

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data.get("email"),
            password=validated_data["password"],
        )
        return user


class HorseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Horse
        fields = ("id", "name", "race")
        read_only_fields = ("id", "race")


class RaceSerializer(serializers.ModelSerializer):
    horses = HorseSerializer(many=True, read_only=True)

    class Meta:
        model = Race
        fields = ("id", "name", "horses")


class PredictionSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    race_name = serializers.CharField(source="race.name", read_only=True)
    first_position_detail = HorseSerializer(source="first_position", read_only=True)
    second_position_detail = HorseSerializer(source="second_position", read_only=True)
    third_position_detail = HorseSerializer(source="third_position", read_only=True)

    class Meta:
        model = Prediction
        fields = (
            "id",
            "race",
            "race_name",
            "first_position",
            "second_position",
            "third_position",
            "first_position_detail",
            "second_position_detail",
            "third_position_detail",
            "created_at",
            "user",
        )
        read_only_fields = ("id", "created_at", "user")


class UserProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    profile_image_url = serializers.SerializerMethodField()

    class Meta:
        model = UserProfile
        fields = ("id", "user", "profile_image", "profile_image_url", "updated_at")
        read_only_fields = ("id", "user", "updated_at")

    def get_profile_image_url(self, obj):
        request = self.context.get("request")
        if obj.profile_image and request:
            return request.build_absolute_uri(obj.profile_image.url)
        if obj.profile_image:
            return obj.profile_image.url
        return None


class FollowSerializer(serializers.ModelSerializer):
    follower = UserSerializer(read_only=True)
    followed = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())

    class Meta:
        model = Follow
        fields = ("id", "follower", "followed")
        read_only_fields = ("id", "follower")

    def validate_followed(self, value):
        request = self.context.get("request")
        if request and value == request.user:
            raise serializers.ValidationError("自分自身をフォローすることはできません。")
        return value


class PredictionGroupSerializer(serializers.ModelSerializer):
    members = UserSerializer(many=True, read_only=True)

    class Meta:
        model = PredictionGroup
        fields = ("id", "name", "members")
        read_only_fields = ("id",)


class GroupMessageSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)

    class Meta:
        model = GroupMessage
        fields = ("id", "group", "sender", "content", "timestamp")
        read_only_fields = ("id", "sender", "timestamp")


class GroupPredictionSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    race_name = serializers.CharField(source="race.name", read_only=True)

    class Meta:
        model = GroupPrediction
        fields = (
            "id",
            "group",
            "user",
            "race",
            "race_name",
            "first_position",
            "second_position",
            "third_position",
            "submitted_at",
        )
        read_only_fields = ("id", "user", "submitted_at")


class RaceResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = RaceResult
        fields = (
            "id",
            "race",
            "first_place",
            "second_place",
            "third_place",
            "updated_at",
        )
        read_only_fields = ("id", "updated_at")


class UserPointSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = UserPoint
        fields = ("id", "user", "points")
        read_only_fields = ("id", "user")

