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
        fields = ("id", "name")
        read_only_fields = ("id")


class RaceSerializer(serializers.ModelSerializer):
    horses = HorseSerializer(many=True, read_only=True)

    class Meta:
        model = Race
        fields = ("id", "name", "date", "location", "horses")


class PredictionSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    race = RaceSerializer(read_only=True) 
    race_name = serializers.CharField(source="race.name", read_only=True)
    race_date = serializers.CharField(source="race.date", read_only=True)        # ⭐ 追加
    race_location = serializers.CharField(source="race.location", read_only=True) # ⭐ 追加
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

class PredictionCreateSerializer(serializers.ModelSerializer):
    comment = serializers.CharField(
        required=False,
        allow_blank=True,
        max_length=20,
        default="",
        trim_whitespace=False  # Don't strip whitespace automatically
    )

    class Meta:
        model = Prediction
        fields = (
            "race",
            "first_position",
            "second_position",
            "third_position",
            "comment",
        )

    def to_internal_value(self, data):
        # Custom handling to ensure comment is never None
        if 'comment' in data and data['comment'] is None:
            data = data.copy()
            data['comment'] = ''
        return super().to_internal_value(data)

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
    member_count = serializers.SerializerMethodField()

    class Meta:
        model = PredictionGroup
        fields = ("id", "name", "members", "member_count")
        read_only_fields = ("id",)

    def get_member_count(self, obj):
        return obj.members.count()


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

class TimelinePredictionSerializer(serializers.ModelSerializer):
    race_name = serializers.CharField(source="race.name", read_only=True)
    race_date = serializers.CharField(source="race.date", read_only=True)        # ⭐ 追加
    race_location = serializers.CharField(source="race.location", read_only=True) # ⭐ 追加
    first_position_name = serializers.CharField(source="first_position.name", read_only=True)
    second_position_name = serializers.CharField(source="second_position.name", read_only=True)
    third_position_name = serializers.CharField(source="third_position.name", read_only=True)
    comment = serializers.CharField(required=False, allow_blank=True, allow_null=True, max_length=20,)
    user = serializers.SerializerMethodField()

    class Meta:
        model = Prediction
        fields = (
            "id",
            "race_name",
            "race_date",        # ⭐ 追加
            "race_location",    # ⭐ 追加
            "first_position_name",
            "second_position_name",
            "third_position_name",
            "comment",
            "created_at",
            "user",
        )

    def get_user(self, obj):
        request = self.context.get("request")
        
        # デフォルト画像のパス
        DEFAULT_PROFILE_IMAGE = "profile_images/default-image.jpg"

        # プロフィール画像が存在する場合
        if hasattr(obj.user, "userprofile") and obj.user.userprofile.profile_image:
            if request:
                profile_image_url = request.build_absolute_uri(
                    obj.user.userprofile.profile_image.url
                )
            else:
                profile_image_url = obj.user.userprofile.profile_image.url
        else:
            # プロフィール画像がない場合、デフォルト画像を使用
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
