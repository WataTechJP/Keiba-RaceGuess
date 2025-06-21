import csv
from django.core.management.base import BaseCommand
from prediction.models import Race, Horse

class Command(BaseCommand):
    help = 'Import horses from a CSV file'

    def add_arguments(self, parser):
        parser.add_argument('csv_file', type=str)

    def handle(self, *args, **options):
        csv_file = options['csv_file']
        with open(csv_file, newline='', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                race_name = row['race_name']
                horse_name = row['horse_name']

                race, _ = Race.objects.get_or_create(name=race_name)
                Horse.objects.get_or_create(name=horse_name, race=race)

        self.stdout.write(self.style.SUCCESS("✅ Horses imported successfully."))
