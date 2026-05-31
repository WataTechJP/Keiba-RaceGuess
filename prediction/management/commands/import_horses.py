import csv
from datetime import datetime, time
from django.utils.dateparse import parse_date, parse_datetime
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
        parser.add_argument(
            '--race-date',
            type=str,
            help='Race date/time to use when the CSV does not have a race_date column. Example: 2026-05-31 15:40',
        )
        parser.add_argument(
            '--race-location',
            type=str,
            help='Race location to use when the CSV does not have a race_location column',
        )

    def handle(self, *args, **options):
        csv_file = options['csv_file']
        default_race_name = options.get('race_name')
        default_race_date = options.get('race_date')
        default_race_location = options.get('race_location')

        with open(csv_file, newline='', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            if not reader.fieldnames or 'horse_name' not in reader.fieldnames:
                self.stderr.write(self.style.ERROR("CSV must have a horse_name column."))
                return

            for row in reader:
                race_name = row.get('race_name') or default_race_name
                race_date = row.get('race_date') or default_race_date
                race_location = row.get('race_location') or default_race_location
                horse_name = row['horse_name'].strip()

                if not race_name:
                    self.stderr.write(
                        self.style.ERROR(
                            "CSV must have a race_name column or you must pass --race-name."
                        )
                    )
                    return

                race_name = race_name.strip()
                race_date = race_date.strip() if race_date else None
                race_location = race_location.strip() if race_location else None

                if not horse_name:
                    continue

                race, _ = Race.objects.get_or_create(name=race_name)
                update_fields = []
                if race_date:
                    parsed_datetime = parse_datetime(race_date)
                    parsed_date = parse_date(race_date)
                    if not parsed_datetime and not parsed_date:
                        self.stderr.write(
                            self.style.ERROR(
                                f"Invalid race_date: {race_date}. Use YYYY-MM-DD or YYYY-MM-DD HH:MM."
                            )
                        )
                        return

                    race.date = parsed_datetime or datetime.combine(parsed_date, time.min)
                    update_fields.append('date')

                if race_location:
                    race.location = race_location
                    update_fields.append('location')

                if update_fields:
                    race.save(update_fields=update_fields)

                Horse.objects.get_or_create(name=horse_name, race=race)

        self.stdout.write(self.style.SUCCESS("✅ Horses, Race date and location imported successfully."))
