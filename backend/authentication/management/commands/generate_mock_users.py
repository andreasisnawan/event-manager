"""
Django management command to generate mock attendee users.

Usage:
    python manage.py generate_mock_users              # Generate 10 mock attendees
    python manage.py generate_mock_users --count 20   # Generate specific number
    python manage.py generate_mock_users --reset      # Delete and regenerate
    python manage.py generate_mock_users --clear      # Only delete mock users
"""

import random

from authentication.models import User
from django.core.management.base import BaseCommand
from django.db import transaction


class Command(BaseCommand):
    help = "Generate mock attendee users for testing"

    def add_arguments(self, parser):
        parser.add_argument(
            "--count",
            type=int,
            default=10,
            help="Number of mock attendees to generate (default: 10)",
        )
        parser.add_argument(
            "--reset",
            action="store_true",
            help="Clear existing mock users before generating new ones",
        )
        parser.add_argument(
            "--clear",
            action="store_true",
            help="Only clear existing mock users without generating new ones",
        )

    @transaction.atomic
    def handle(self, *args, **options):
        count = options["count"]
        should_reset = options["reset"]
        should_clear = options["clear"]

        if should_reset or should_clear:
            self.clear_mock_users()

        if not should_clear:
            self.stdout.write("Generating mock attendee users...")
            users_created = self.create_mock_attendees(count)
            self.stdout.write(
                self.style.SUCCESS(f"✓ Created {users_created} mock attendee users")
            )
            self.stdout.write(
                self.style.SUCCESS("✓ Mock users generated successfully")
            )

    def clear_mock_users(self):
        """Delete all mock attendee users (username starts with 'attendee_')"""
        self.stdout.write("Clearing existing mock users...")

        # Delete mock attendees (username starts with 'attendee_')
        deleted_count = User.objects.filter(
            username__startswith="attendee_", role=User.ATTENDEE
        ).delete()[0]

        self.stdout.write(f"  - Deleted {deleted_count} mock attendee users")

    def create_mock_attendees(self, count):
        """Create mock attendee users"""
        first_names = [
            "Andi",
            "Budi",
            "Citra",
            "Dewi",
            "Eko",
            "Fitri",
            "Galih",
            "Hani",
            "Indra",
            "Joko",
            "Kartika",
            "Lina",
            "Maya",
            "Nanda",
            "Omar",
            "Putri",
            "Qori",
            "Rini",
            "Sari",
            "Toni",
            "Udin",
            "Vina",
            "Wawan",
            "Yanti",
            "Zaki",
        ]

        last_names = [
            "Saputra",
            "Pratama",
            "Wijaya",
            "Santoso",
            "Kusuma",
            "Perdana",
            "Wibowo",
            "Setiawan",
            "Nugroho",
            "Hidayat",
            "Rahman",
            "Hermawan",
            "Permana",
            "Gunawan",
            "Firmansyah",
        ]

        users_created = 0

        for i in range(1, count + 1):
            first_name = random.choice(first_names)
            last_name = random.choice(last_names)
            username = f"attendee_{i:03d}"
            email = f"{username}@example.com"

            # Check if user already exists
            if User.objects.filter(username=username).exists():
                continue

            user = User.objects.create_user(
                username=username,
                email=email,
                password="password123",  # Simple password for testing
                first_name=first_name,
                last_name=last_name,
                role=User.ATTENDEE,
            )
            users_created += 1

        return users_created
