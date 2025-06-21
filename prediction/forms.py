from django import forms
from .models import Prediction, Horse
from .models import UserProfile
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User

class PredictionForm(forms.ModelForm):
    first_position = forms.ModelChoiceField(queryset=Horse.objects.none())
    second_position = forms.ModelChoiceField(queryset=Horse.objects.none())
    third_position = forms.ModelChoiceField(queryset=Horse.objects.none())

    class Meta:
        model = Prediction
        fields = ['race', 'first_position', 'second_position', 'third_position']
        labels = {
            'race': 'レース',
            'first_position': '🥇 1着',
            'second_position': '🥈 2着',
            'third_position': '🥉 3着',
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        # 🟡 ここを追加（AjaxやPOST時に対応）
        if 'race' in self.data:
            try:
                race_id = int(self.data.get('race'))
                horses = Horse.objects.filter(race_id=race_id)
            except (ValueError, TypeError):
                horses = Horse.objects.none()
        elif self.instance.pk:
            # 編集時の初期値設定
            horses = self.instance.race.horse_set.all()
        else:
            horses = Horse.objects.none()

        self.fields['first_position'].queryset = horses
        self.fields['second_position'].queryset = horses
        self.fields['third_position'].queryset = horses

class SignUpForm(UserCreationForm):
    class Meta:
        model = User
        fields = ("username", "email", "password1", "password2")


class UserProfileForm(forms.ModelForm):
    class Meta:
        model = UserProfile
        fields = ['profile_image']
