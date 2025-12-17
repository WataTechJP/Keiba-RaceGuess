from .models import Prediction, UserPoint, RaceResult

def evaluate_predictions(race):
    try:
        result = RaceResult.objects.get(race=race)
    except RaceResult.DoesNotExist:
        return

    predictions = Prediction.objects.filter(race=race)

    for pred in predictions:
        score = 0
        if pred.first_position == result.first_place:
            score += 3
        if pred.second_position == result.second_place:
            score += 2
        if pred.third_position == result.third_place:
            score += 1

        user_point, _ = UserPoint.objects.get_or_create(user=pred.user)
        user_point.points += score
        user_point.save()

