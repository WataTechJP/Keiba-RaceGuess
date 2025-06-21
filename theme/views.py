from django.shortcuts import render
from django.http import JsonResponse
from prediction.models import Horse

# Create your views here.
def home(request):
    return render(request, 'home.html')


def get_horses(request):
    race_id = request.GET.get('race_id')
    if race_id:
        horses = Horse.objects.filter(race_id=race_id)
        data = [{'id': h.id, 'name': h.name} for h in horses]
        return JsonResponse(data, safe=False)
    return JsonResponse([], safe=False)
