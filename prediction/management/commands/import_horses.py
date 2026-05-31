import csv
from django.core.management.base import BaseCommand
from prediction.models import Race, Horse

class Command(BaseCommand):
    help = 'Import horses from a CSV file'

    def add_arguments(self, parser):
        parser.add_argument('csv_file', type=str)
        parser.add_argument(
            '--race-name',
            type=str,
            help='Race name to use when the CSV does not have a race_name column',
        )

    def handle(self, *args, **options):
        csv_file = options['csv_file']
        default_race_name = options.get('race_name')

        with open(csv_file, newline='', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            if not reader.fieldnames or 'horse_name' not in reader.fieldnames:
                self.stderr.write(self.style.ERROR("CSV must have a horse_name column."))
                return

            for row in reader:
                race_name = row.get('race_name') or default_race_name
                horse_name = row['horse_name'].strip()

                if not race_name:
                    self.stderr.write(
                        self.style.ERROR(
                            "CSV must have a race_name column or you must pass --race-name."
                        )
                    )
                    return

                race_name = race_name.strip()
                if not horse_name:
                    continue

                race, _ = Race.objects.get_or_create(name=race_name)
                Horse.objects.get_or_create(name=horse_name, race=race)

        self.stdout.write(self.style.SUCCESS("✅ Horses imported successfully."))
