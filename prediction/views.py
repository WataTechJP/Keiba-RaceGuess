from django.shortcuts import render, redirect, get_object_or_404
from django.http import JsonResponse, HttpResponseForbidden
from django.contrib.auth.decorators import login_required
from .models import Prediction, Horse, Race, Follow, PredictionGroup, GroupMessage, GroupPrediction, RaceResult, UserPoint
from django.contrib import messages
from django.contrib.auth.models import User, Group
from django.contrib.auth import login
from .forms import SignUpForm, GroupMessageForm, SelectMyPredictionForm, UserProfileForm, PredictionForm, UserProfileForm
from .utils import evaluate_predictions
from django.contrib.admin.views.decorators import staff_member_required

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

@login_required
def group_list(request):
    groups = request.user.prediction_groups.all()
    return render(request, 'grouplist.html', {'groups': groups})

@login_required
def create_group(request):
    user = request.user
    following_users = User.objects.filter(followers__follower=user).exclude(id=user.id)

    if request.method == "POST":
        group_name = request.POST.get("name")

        # ① グループ名の重複チェック
        if PredictionGroup.objects.filter(name=group_name).exists():
            messages.error(request, "同じ名前のグループがすでに存在します。別の名前にしてください。")
            return render(request, 'create_group.html', {'following_users': following_users})

        group = PredictionGroup.objects.create(name=group_name)
        group.members.add(user)

        member_ids = request.POST.getlist("members")
        if member_ids:
            group.members.add(*member_ids)

        return redirect('group_list')

    return render(request, 'create_group.html', {'following_users': following_users})

@login_required
def group_detail(request, group_id):
    group = get_object_or_404(PredictionGroup, id=group_id)

    if request.method == "POST":
        if 'share_prediction' in request.POST:
            share_form = SelectMyPredictionForm(request.POST, user=request.user, group=group)
            if share_form.is_valid():
                original = share_form.cleaned_data["my_prediction"]
                already_shared = GroupPrediction.objects.filter(group=group, user=request.user, race=original.race).exists()
                if not already_shared:
                    GroupPrediction.objects.create(
                        group=group,
                        user=request.user,
                        race=original.race,
                        first_position=original.first_position,
                        second_position=original.second_position,
                        third_position=original.third_position
                    )
                    messages.success(request, "予想を共有しました。")
                else:
                    messages.warning(request, "このレースの予想はすでに共有されています。")
            else:
                messages.error(request, "予想の共有に失敗しました。")

        elif 'message_submit' in request.POST:
            message_form = GroupMessageForm(request.POST)
            if message_form.is_valid():
                message = message_form.save(commit=False)
                message.group = group
                message.sender = request.user
                message.save()
                messages.success(request, "メッセージを送信しました。")
            else:
                messages.error(request, "メッセージの送信に失敗しました。")

        return redirect('group_detail', group_id=group.id)  # PRGパターン

    # GET の場合
    share_form = SelectMyPredictionForm(user=request.user, group=group)
    message_form = GroupMessageForm()
    messages_list = GroupMessage.objects.filter(group=group).order_by('-timestamp')
    predictions = GroupPrediction.objects.filter(group=group).order_by('-submitted_at')

    return render(request, 'group_detail.html', {
        'group': group,
        'messages': messages_list,
        'predictions': predictions,
        'share_form': share_form,
        'message_form': message_form,
    })

    share_form = SelectMyPredictionForm(user=request.user, group=group)
    group_messages = GroupMessage.objects.filter(group=group).order_by('-timestamp')
    predictions = GroupPrediction.objects.filter(group=group).order_by('-submitted_at')

    return render(request, 'group_detail.html', {
        'group': group,
        'messages': group_messages,
        'predictions': predictions,
        'share_form': share_form,
    })


@login_required
def delete_group_prediction(request, group_id, prediction_id):
    prediction = get_object_or_404(GroupPrediction, id=prediction_id, group_id=group_id)
    if request.user == prediction.user:
        prediction.delete()
        messages.success(request, "予想を削除しました。")
    else:
        messages.error(request, "この予想は削除できません。")
    return redirect('group_detail', group_id=group_id)

@staff_member_required
def evaluate_race(request, race_id):
    race = get_object_or_404(Race, id=race_id)
    evaluate_predictions(race)
    messages.success(request, f"{race.name} の答え合わせを実行しました。")
    return redirect('race_list')  # 適切なURLに戻す

@login_required
def profile_and_points_view(request):
    user = request.user
    profile, _ = UserProfile.objects.get_or_create(user=user)
    
    if request.method == 'POST':
        form = UserProfileForm(request.POST, request.FILES, instance=profile)
        if form.is_valid():
            form.save()
            return redirect('profile')
    else:
        form = UserProfileForm(instance=profile)

    # ユーザーの予想と結果を照合してポイントを再計算
    predictions = Prediction.objects.filter(user=user).select_related('race')
    total_score = 0
    evaluated_results = []

    for pred in predictions:
        result = RaceResult.objects.filter(race=pred.race).first()
        if result:
            score = 0
            if pred.first_position == result.first_place:
                score += 3
            if pred.second_position == result.second_place:
                score += 2
            if pred.third_position == result.third_place:
                score += 1
            total_score += score
            evaluated_results.append({
                'race_name': pred.race.name,
                'predicted_1': pred.first_position.name if pred.first_position else "―",
                'predicted_2': pred.second_position.name if pred.second_position else "―",
                'predicted_3': pred.third_position.name if pred.third_position else "―",
                'actual_1': result.first_place.name if result.first_place else "―",
                'actual_2': result.second_place.name if result.second_place else "―",
                'actual_3': result.third_place.name if result.third_place else "―",
                'score': score,
            })

    # ポイントを最新に保存
    user_point, _ = UserPoint.objects.get_or_create(user=user)
    user_point.points = total_score
    user_point.save()

    context = {
        'form': form,
        'profile': profile,
        'user_point': user_point,
        'evaluated_results': evaluated_results,
    }
    return render(request, 'my_profile_and_points.html', context)

@login_required
def result_list_view(request):
    user = request.user
    predictions = Prediction.objects.filter(user=user).select_related('race')
    evaluated_results = []

    total_score = 0  # ← これを加えて点数合計も反映
    for pred in predictions:
        result = RaceResult.objects.filter(race=pred.race).first()
        if result:
            score = 0
            if pred.first_position == result.first_place:
                score += 3
            if pred.second_position == result.second_place:
                score += 2
            if pred.third_position == result.third_place:
                score += 1

            total_score += score

            evaluated_results.append({
                'race_name': pred.race.name,
                'predicted_1': pred.first_position.name if pred.first_position else "―",
                'predicted_2': pred.second_position.name if pred.second_position else "―",
                'predicted_3': pred.third_position.name if pred.third_position else "―",
                'actual_1': result.first_place.name if result.first_place else "―",
                'actual_2': result.second_place.name if result.second_place else "―",
                'actual_3': result.third_place.name if result.third_place else "―",
                'score': score,
            })

    # ← ポイント保存（optionalだけど揃えるなら入れる）
    user_point, _ = UserPoint.objects.get_or_create(user=user)
    user_point.points = total_score
    user_point.save()

    return render(request, 'result_list.html', {
        'evaluated_results': evaluated_results,
        'user_point': user_point,  # ← これが無いとテンプレートで `user_point.points` が使えない
    })


import io
import base64
import matplotlib.pyplot as plt
import matplotlib
matplotlib.use('Agg')  # GUI不要のバックエンドを使用

@login_required
def analysis_view(request):
    """データ分析ビュー"""
    try:
        # インポートを関数内に移動
        from django.db.models import Count
        from django.db.models.functions import TruncMonth  # ← ここを修正
        
        # データ取得
        predictions = list(Prediction.objects.values())
        races = list(Race.objects.values())
        horses = list(Horse.objects.values())
        results = list(RaceResult.objects.values())
        
        # 統計データ計算
        stats = {
            'total_predictions': len(predictions),
            'total_races': len(races),
            'total_horses': len(horses),
            'total_results': len(results),
            'total_users': User.objects.count(),
            'total_groups': PredictionGroup.objects.count(),
        }
        
        # 的中率計算
        correct_predictions = 0
        total_evaluated = 0
        
        for pred_data in predictions:
            pred = Prediction.objects.get(id=pred_data['id'])
            result = RaceResult.objects.filter(race=pred.race).first()
            if result:
                total_evaluated += 1
                if (pred.first_position == result.first_place or 
                    pred.second_position == result.second_place or 
                    pred.third_position == result.third_place):
                    correct_predictions += 1
        
        accuracy_rate = (correct_predictions / total_evaluated * 100) if total_evaluated > 0 else 0
        stats['accuracy_rate'] = round(accuracy_rate, 1)
        stats['evaluated_predictions'] = total_evaluated
        
        # グラフ作成
        plt.figure(figsize=(15, 10))
        plt.style.use('default')
        
        # 日本語フォント設定
        try:
            plt.rcParams['font.family'] = 'Hiragino Sans'
        except:
            pass
        
        # 2x3のサブプロット
        # 1. データ件数分布
        plt.subplot(2, 3, 1)
        categories = ['予想', 'レース', '馬', '結果', 'ユーザー']
        values = [stats['total_predictions'], stats['total_races'], 
                 stats['total_horses'], stats['total_results'], stats['total_users']]
        colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57']
        plt.bar(categories, values, color=colors)
        plt.title('データ件数分布')
        plt.ylabel('件数')
        plt.xticks(rotation=45)
        
        # 2. 的中率表示
        plt.subplot(2, 3, 2)
        labels = ['的中', '外れ']
        sizes = [correct_predictions, total_evaluated - correct_predictions] if total_evaluated > 0 else [1, 1]
        colors = ['#2ECC71', '#E74C3C']
        plt.pie(sizes, labels=labels, colors=colors, autopct='%1.1f%%', startangle=90)
        plt.title(f'予想的中率\n({stats["accuracy_rate"]}%)')
        
        # 3. ユーザー別予想数
        plt.subplot(2, 3, 3)
        user_pred_counts = Prediction.objects.values('user__username').annotate(
            count=Count('id')).order_by('-count')[:5]
        
        if user_pred_counts:
            usernames = [item['user__username'] for item in user_pred_counts]
            counts = [item['count'] for item in user_pred_counts]
            plt.bar(usernames, counts, color='#3498DB')
            plt.title('予想数TOP5ユーザー')
            plt.ylabel('予想数')
            plt.xticks(rotation=45)
        else:
            plt.text(0.5, 0.5, 'データなし', ha='center', va='center')
            plt.title('予想数TOP5ユーザー')
        
        # 4. レース別予想数
        plt.subplot(2, 3, 4)
        race_pred_counts = Prediction.objects.values('race__name').annotate(
            count=Count('id')).order_by('-count')[:5]
        
        if race_pred_counts:
            race_names = [item['race__name'][:10] + '...' if len(item['race__name']) > 10 
                         else item['race__name'] for item in race_pred_counts]
            counts = [item['count'] for item in race_pred_counts]
            plt.bar(race_names, counts, color='#E67E22')
            plt.title('予想数TOP5レース')
            plt.ylabel('予想数')
            plt.xticks(rotation=45)
        else:
            plt.text(0.5, 0.5, 'データなし', ha='center', va='center')
            plt.title('予想数TOP5レース')
        
        # 5. ポイント分布
        plt.subplot(2, 3, 5)
        user_points = UserPoint.objects.all().values_list('points', flat=True)
        if user_points:
            plt.hist(user_points, bins=10, color='#9B59B6', alpha=0.7)
            plt.title('ユーザーポイント分布')
            plt.xlabel('ポイント')
            plt.ylabel('ユーザー数')
        else:
            plt.text(0.5, 0.5, 'ポイントデータなし', ha='center', va='center')
            plt.title('ユーザーポイント分布')
        
        # 6. 月別予想数（時系列）- TruncMonthを使用
        plt.subplot(2, 3, 6)
        try:
            monthly_data = Prediction.objects.annotate(
                month=TruncMonth('created_at')).values('month').annotate(
                count=Count('id')).order_by('month')
            
            if monthly_data:
                months = [item['month'].strftime('%Y-%m') for item in monthly_data]
                counts = [item['count'] for item in monthly_data]
                plt.plot(months, counts, marker='o', color='#1ABC9C')
                plt.title('月別予想数推移')
                plt.xlabel('月')
                plt.ylabel('予想数')
                plt.xticks(rotation=45)
            else:
                plt.text(0.5, 0.5, '時系列データなし', ha='center', va='center')
                plt.title('月別予想数推移')
        except Exception:
            # TruncMonthでエラーが出る場合は簡単なグラフに変更
            plt.text(0.5, 0.5, '時系列データ準備中', ha='center', va='center')
            plt.title('月別予想数推移')
        
        plt.tight_layout()
        
        # Base64エンコード
        buffer = io.BytesIO()
        plt.savefig(buffer, format='png', dpi=150, bbox_inches='tight')
        buffer.seek(0)
        chart_data = base64.b64encode(buffer.getvalue()).decode()
        plt.close()
        
        context = {
            'stats': stats,
            'chart': chart_data,
            'success': True
        }
        
    except Exception as e:
        context = {
            'error': str(e),
            'success': False
        }
    
    return render(request, 'prediction/analysis.html', context)
