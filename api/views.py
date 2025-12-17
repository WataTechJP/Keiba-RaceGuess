from django.contrib.auth.models import User
from django.db.models import Prefetch
from rest_framework import generics, permissions, viewsets
from rest_framework.exceptions import PermissionDenied
from rest_framework.authtoken.models import Token
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from prediction.models import (
    Follow,
    GroupMessage,
    GroupPrediction,
    Prediction,
    PredictionGroup,
    Race,
    RaceResult,
    UserPoint,
    UserProfile,
)
from .serializers import (
    FollowSerializer,
    GroupMessageSerializer,
    GroupPredictionSerializer,
    PredictionGroupSerializer,
    PredictionSerializer,
    TimelinePredictionSerializer,
    RaceResultSerializer,
    RaceSerializer,
    UserPointSerializer,
    UserProfileSerializer,
    UserRegistrationSerializer,
)


class CustomAuthToken(ObtainAuthToken):
    """Returns auth token + basic user info."""

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        token = Token.objects.get(key=response.data["token"])
        return Response(
            {
                "token": token.key,
                "user": {
                    "id": token.user.id,
                    "username": token.user.username,
                    "email": token.user.email,
                },
            }
        )


class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        Token.objects.filter(user=request.user).delete()
        return Response({"detail": "Logged out"})


class SignUpView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = UserRegistrationSerializer


class RaceViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Race.objects.prefetch_related(
        Prefetch("horses")
    )
    serializer_class = RaceSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return Race.objects.prefetch_related("horses").order_by("name")


class PredictionViewSet(viewsets.ModelViewSet):
    serializer_class = PredictionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return (
            Prediction.objects.filter(user=self.request.user)
            .select_related(
                "race",
                "first_position",
                "second_position",
                "third_position",
            )
            .order_by("-created_at")
        )

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(
        detail=False,
        methods=["get"],
        url_path="timeline",
        permission_classes=[permissions.IsAuthenticated],
    )
    def timeline(self, request):
        race_id = request.query_params.get("race_id")
        following_ids = list(
            request.user.following.values_list("followed_id", flat=True)
        )
        user_ids = following_ids + [request.user.id]

        queryset = (
            Prediction.objects.filter(user__id__in=user_ids)
            .select_related(
                "race",
                "first_position",
                "second_position",
                "third_position",
                "user",
                "user__userprofile",
            )
            .order_by("-created_at")
        )

        if race_id:
            queryset = queryset.filter(race_id=race_id)

        serializer = TimelinePredictionSerializer(
            queryset, many=True, context={"request": request}
        )
        return Response(serializer.data)


class FollowViewSet(viewsets.ModelViewSet):
    serializer_class = FollowSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Follow.objects.filter(follower=self.request.user).select_related(
            "followed"
        )

    def perform_create(self, serializer):
        serializer.save(follower=self.request.user)


class UserProfileViewSet(viewsets.ModelViewSet):
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return UserProfile.objects.filter(user=self.request.user)


class PredictionGroupViewSet(viewsets.ModelViewSet):
    serializer_class = PredictionGroupSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return self.request.user.prediction_groups.all().prefetch_related("members")

    def perform_create(self, serializer):
        group = serializer.save()
        group.members.add(self.request.user)

    @action(detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated])
    def messages(self, request, pk=None):
        group = self.get_object()
        if request.user not in group.members.all():
            return Response({"detail": "グループメンバーのみ送信できます。"}, status=403)
        serializer = GroupMessageSerializer(data=request.data, context={"request": request})
        if serializer.is_valid():
            serializer.save(group=group, sender=request.user)
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)


class GroupPredictionViewSet(viewsets.ModelViewSet):
    serializer_class = GroupPredictionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return GroupPrediction.objects.filter(group__members=self.request.user).select_related(
            "group",
            "race",
            "user",
        )

    def perform_create(self, serializer):
        group = serializer.validated_data["group"]
        if self.request.user not in group.members.all():
            raise PermissionDenied("グループメンバーのみ共有できます。")
        serializer.save(user=self.request.user)


class GroupMessageViewSet(viewsets.ModelViewSet):
    serializer_class = GroupMessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return GroupMessage.objects.filter(group__members=self.request.user).select_related(
            "group",
            "sender",
        )

    def perform_create(self, serializer):
        group = serializer.validated_data["group"]
        if self.request.user not in group.members.all():
            raise PermissionDenied("グループメンバーのみ送信できます。")
        serializer.save(sender=self.request.user)


class RaceResultViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = RaceResultSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = RaceResult.objects.select_related(
        "race", "first_place", "second_place", "third_place"
    )


class UserPointViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = UserPointSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return UserPoint.objects.filter(user=self.request.user)




def calculate_hit_rate(user):
    """
    的中率を計算する
    
    計算方法:
    1. ユーザーの全予想を取得
    2. レース結果がある予想のみ対象
    3. 的中した馬の数を数える
    4. パーセンテージを計算
    """
    # ユーザーの全予想を取得
    predictions = Prediction.objects.filter(user=user)
    
    # 予想した馬の総数（1予想 = 3頭）
    total_horses = predictions.count() * 3
    
    # 予想がない場合
    if total_horses == 0:
        return 0
    
    # 的中数をカウント
    hit_count = 0
    
    for prediction in predictions:
        # このレースの結果があるか確認
        try:
            result = RaceResult.objects.get(race=prediction.race)
            
            # 1着が的中しているか
            if prediction.first_position == result.first_place:
                hit_count += 1
            
            # 2着が的中しているか
            if prediction.second_position == result.second_place:
                hit_count += 1
            
            # 3着が的中しているか
            if prediction.third_position == result.third_place:
                hit_count += 1
                
        except RaceResult.DoesNotExist:
            # レース結果がまだない場合はスキップ
            continue
    
    # 的中率を計算（小数点第1位まで）
    hit_rate = round((hit_count / total_horses) * 100, 1)
    
    return hit_rate


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_profile(request):
    """現在のユーザーのプロフィール詳細を取得"""
    user = request.user
    
    # 統計情報を集計
    predictions_count = Prediction.objects.filter(user=user).count()
    followers_count = Follow.objects.filter(followed=user).count()
    
    # ポイントを取得
    try:
        user_point = UserPoint.objects.get(user=user)
        points = user_point.points
    except UserPoint.DoesNotExist:
        points = 0
    
    # ✅ 的中率の計算
    hit_rate = calculate_hit_rate(user)
    
    # プロフィール画像URLを取得
    profile_image_url = None
    DEFAULT_IMAGE = "profile_images/default-image.jpg"
    
    if hasattr(user, 'userprofile') and user.userprofile.profile_image:
        profile_image_url = request.build_absolute_uri(user.userprofile.profile_image.url)
    else:
        # デフォルト画像
        from django.conf import settings
        profile_image_url = request.build_absolute_uri(f"{settings.MEDIA_URL}{DEFAULT_IMAGE}")
    
    return Response({
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'profile': {
            'profile_image_url': profile_image_url,
            'updated_at': user.userprofile.updated_at if hasattr(user, 'userprofile') else None,
        },
        'predictions_count': predictions_count,
        'followers_count': followers_count,
        'hit_rate': hit_rate,
        'points': points,
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def results_list(request):
    """ユーザーの予想結果一覧を取得"""
    user = request.user
    
    # ユーザーの予想を取得
    predictions = Prediction.objects.filter(user=user)
    
    results = []
    
    for prediction in predictions:
        # レース結果があるか確認
        try:
            race_result = RaceResult.objects.get(race=prediction.race)
            
            # ポイントを計算
            score = 0
            if prediction.first_position == race_result.first_place:
                score += 3
            if prediction.second_position == race_result.second_place:
                score += 2
            if prediction.third_position == race_result.third_place:
                score += 1
            
            # レスポンスに追加
            results.append({
                'id': prediction.id,
                'race_name': prediction.race.name,
                # 'race_date': prediction.race.date.isoformat(),
                'race_location': prediction.race.location,
                'predicted_1': prediction.first_position.name,
                'predicted_2': prediction.second_position.name,
                'predicted_3': prediction.third_position.name,
                'actual_1': race_result.first_place.name,
                'actual_2': race_result.second_place.name,
                'actual_3': race_result.third_place.name,
                'score': score,
            })
            
        except RaceResult.DoesNotExist:
            # レース結果がまだない場合はスキップ
            continue
    
    return Response(results)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_points(request):
    """ユーザーの合計ポイントと的中率を取得"""
    user = request.user
    
    # ポイントを取得
    try:
        user_point = UserPoint.objects.get(user=user)
        points = user_point.points
    except UserPoint.DoesNotExist:
        points = 0
    
    # ✅ 的中率を計算
    hit_rate = calculate_hit_rate(user)
    
    return Response({
        'points': points,
        'hit_rate': hit_rate
    })

# api/views.py

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def points_ranking(request):
    """ポイントランキング（TOP 20）"""
    from django.db.models import Count
    
    # UserPointが存在するユーザーを取得
    rankings = []
    user_points = UserPoint.objects.select_related('user').order_by('-points')[:20]
    
    for rank, user_point in enumerate(user_points, start=1):
        user = user_point.user
        predictions_count = Prediction.objects.filter(user=user).count()
        hit_rate = calculate_hit_rate(user)
        
        # プロフィール画像URL
        profile_image_url = None
        if hasattr(user, 'userprofile') and user.userprofile.profile_image:
            profile_image_url = request.build_absolute_uri(user.userprofile.profile_image.url)
        
        rankings.append({
            'rank': rank,
            'user_id': user.id,
            'username': user.username,
            'profile_image_url': profile_image_url,
            'points': user_point.points,
            'hit_rate': hit_rate,
            'predictions_count': predictions_count,
        })
    
    return Response(rankings)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def hit_rate_ranking(request):
    """的中率ランキング（TOP 20）"""
    from django.contrib.auth.models import User
    
    # 全ユーザーの的中率を計算
    users_data = []
    
    for user in User.objects.all():
        predictions_count = Prediction.objects.filter(user=user).count()
        
        # 予想が3件以上のユーザーのみ対象
        if predictions_count >= 3:
            hit_rate = calculate_hit_rate(user)
            
            try:
                user_point = UserPoint.objects.get(user=user)
                points = user_point.points
            except UserPoint.DoesNotExist:
                points = 0
            
            # プロフィール画像URL
            profile_image_url = None
            if hasattr(user, 'userprofile') and user.userprofile.profile_image:
                profile_image_url = request.build_absolute_uri(user.userprofile.profile_image.url)
            
            users_data.append({
                'user_id': user.id,
                'username': user.username,
                'profile_image_url': profile_image_url,
                'points': points,
                'hit_rate': hit_rate,
                'predictions_count': predictions_count,
            })
    
    # 的中率でソート
    users_data.sort(key=lambda x: x['hit_rate'], reverse=True)
    
    # TOP 20 + ランク番号を追加
    rankings = []
    for rank, user_data in enumerate(users_data[:20], start=1):
        user_data['rank'] = rank
        rankings.append(user_data)
    
    return Response(rankings)
