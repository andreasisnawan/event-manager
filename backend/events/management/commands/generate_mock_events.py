"""
Django management command to generate mock technical event data.

Usage:
    python manage.py generate_mock_events          # Generate mock data
    python manage.py generate_mock_events --reset  # Reset and regenerate
    python manage.py generate_mock_events --clear  # Only clear existing mock data
"""

import random
from datetime import datetime, timedelta

from authentication.models import User
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone
from django.utils.text import slugify
from events.models import Event, Registration, Session, Speaker, Track, Venue


class Command(BaseCommand):
    help = "Generate mock technical event data for testing"

    def add_arguments(self, parser):
        parser.add_argument(
            "--reset",
            action="store_true",
            help="Clear existing mock data before generating new data",
        )
        parser.add_argument(
            "--clear",
            action="store_true",
            help="Only clear existing mock data without generating new data",
        )

    def handle(self, *args, **options):
        if options["reset"] or options["clear"]:
            self.clear_mock_data()
            if options["clear"]:
                self.stdout.write(
                    self.style.SUCCESS("✓ Mock data cleared successfully")
                )
                return

        self.generate_mock_data()
        self.stdout.write(self.style.SUCCESS("✓ Mock data generated successfully"))

    @transaction.atomic
    def clear_mock_data(self):
        """Clear all existing mock data"""
        self.stdout.write("Clearing existing mock data...")

        # Delete in order of dependencies
        deleted_registrations = Registration.objects.all().delete()[0]
        deleted_sessions = Session.objects.all().delete()[0]
        deleted_tracks = Track.objects.all().delete()[0]
        deleted_events = Event.objects.all().delete()[0]
        deleted_speakers = Speaker.objects.all().delete()[0]
        deleted_venues = Venue.objects.all().delete()[0]

        self.stdout.write(f"  - Deleted {deleted_registrations} registrations")
        self.stdout.write(f"  - Deleted {deleted_sessions} sessions")
        self.stdout.write(f"  - Deleted {deleted_tracks} tracks")
        self.stdout.write(f"  - Deleted {deleted_events} events")
        self.stdout.write(f"  - Deleted {deleted_speakers} speakers")
        self.stdout.write(f"  - Deleted {deleted_venues} venues")

    @transaction.atomic
    def generate_mock_data(self):
        """Generate comprehensive mock data for technical events"""
        self.stdout.write("Generating mock data...")

        # Create venues
        venues = self.create_venues()
        self.stdout.write(f"  ✓ Created {len(venues)} venues")

        # Create speakers
        speakers = self.create_speakers()
        self.stdout.write(f"  ✓ Created {len(speakers)} speakers")

        # Create events
        events = self.create_events(venues)
        self.stdout.write(f"  ✓ Created {len(events)} events")

        # Create tracks for each event
        tracks_count = 0
        for event in events:
            tracks = self.create_tracks(event)
            tracks_count += len(tracks)
        self.stdout.write(f"  ✓ Created {tracks_count} tracks")

        # Create sessions for each event
        sessions_count = 0
        for event in events:
            sessions = self.create_sessions(event, speakers)
            sessions_count += len(sessions)
        self.stdout.write(f"  ✓ Created {sessions_count} sessions")

        # Create registrations
        registrations_count = self.create_registrations(events)
        self.stdout.write(f"  ✓ Created {registrations_count} registrations")

    def create_venues(self):
        """Create mock venues in Indonesian cities"""
        venues_data = [
            {
                "name": "Jakarta Convention Center",
                "address": "Jl. Gatot Subroto, Kav. 52-53, Senayan",
                "city": "Jakarta",
                "capacity": 5000,
            },
            {
                "name": "Balai Sarbini",
                "address": "Jl. Sisingamangaraja No. 73",
                "city": "Jakarta",
                "capacity": 3000,
            },
            {
                "name": "Trans Luxury Hotel Bandung",
                "address": "Jl. Gatot Subroto No. 289",
                "city": "Bandung",
                "capacity": 1500,
            },
            {
                "name": "Grand City Convention Hall",
                "address": "Jl. Pemuda No. 118",
                "city": "Surabaya",
                "capacity": 2500,
            },
            {
                "name": "Harris Hotel & Conventions Malang",
                "address": "Jl. Letjen S. Parman No. 87-89",
                "city": "Malang",
                "capacity": 1000,
            },
            {
                "name": "Bali Nusa Dua Convention Center",
                "address": "Kawasan Pariwisata Nusa Dua",
                "city": "Denpasar",
                "capacity": 4000,
            },
            {
                "name": "Hotel Santika Premiere Yogyakarta",
                "address": "Jl. Jenderal Sudirman No. 19",
                "city": "Yogyakarta",
                "capacity": 800,
            },
            {
                "name": "Polonia Convention Center",
                "address": "Jl. Gatot Subroto KM. 7",
                "city": "Medan",
                "capacity": 1800,
            },
        ]

        venues = []
        for data in venues_data:
            venue = Venue.objects.create(**data)
            venues.append(venue)

        return venues

    def create_speakers(self):
        """Create mock speakers for technical events"""
        speakers_data = [
            {
                "name": "Budi Rahardjo",
                "bio": "Cybersecurity expert and Professor at ITB. Author of multiple books on information security.",
                "avatar_url": "https://i.pravatar.cc/150?img=12",
                "contact_email": "budi.rahardjo@example.com",
            },
            {
                "name": "Riza Fahmi",
                "bio": "Developer advocate and founder of HackerPair. Passionate about JavaScript and developer communities.",
                "avatar_url": "https://i.pravatar.cc/150?img=33",
                "contact_email": "riza.fahmi@example.com",
            },
            {
                "name": "Ainun Najib",
                "bio": "Full-stack developer and tech educator. Specializes in React and Node.js development.",
                "avatar_url": "https://i.pravatar.cc/150?img=13",
                "contact_email": "ainun.najib@example.com",
            },
            {
                "name": "Sinta Dewi",
                "bio": "Machine Learning engineer at a leading tech company. Expert in deep learning and NLP.",
                "avatar_url": "https://i.pravatar.cc/150?img=45",
                "contact_email": "sinta.dewi@example.com",
            },
            {
                "name": "Andi Suryanto",
                "bio": "Cloud architect with 15+ years of experience. AWS and GCP certified professional.",
                "avatar_url": "https://i.pravatar.cc/150?img=51",
                "contact_email": "andi.suryanto@example.com",
            },
            {
                "name": "Maya Kartika",
                "bio": "UX/UI designer and design system advocate. Founder of Indonesia Design Community.",
                "avatar_url": "https://i.pravatar.cc/150?img=47",
                "contact_email": "maya.kartika@example.com",
            },
            {
                "name": "Hendra Wijaya",
                "bio": "DevOps engineer and Kubernetes enthusiast. Speaker at various tech conferences.",
                "avatar_url": "https://i.pravatar.cc/150?img=56",
                "contact_email": "hendra.wijaya@example.com",
            },
            {
                "name": "Fitria Rahman",
                "bio": "Mobile developer specializing in Flutter. Google Developer Expert for Flutter.",
                "avatar_url": "https://i.pravatar.cc/150?img=38",
                "contact_email": "fitria.rahman@example.com",
            },
            {
                "name": "Dimas Prasetyo",
                "bio": "Backend engineer focused on microservices architecture and distributed systems.",
                "avatar_url": "https://i.pravatar.cc/150?img=15",
                "contact_email": "dimas.prasetyo@example.com",
            },
            {
                "name": "Lestari Putri",
                "bio": "Data scientist and AI researcher. PhD in Computer Science from top university.",
                "avatar_url": "https://i.pravatar.cc/150?img=44",
                "contact_email": "lestari.putri@example.com",
            },
        ]

        speakers = []
        for data in speakers_data:
            speaker = Speaker.objects.create(**data)
            speakers.append(speaker)

        return speakers

    def create_events(self, venues):
        """Create mock technical events"""
        now = timezone.now()

        events_data = [
            {
                "title": "Indonesia Developer Summit 2025",
                "description": "The largest developer conference in Indonesia featuring the latest trends in software development, cloud computing, and emerging technologies. Join thousands of developers, engineers, and tech leaders.",
                "days_from_now": 30,
                "duration_days": 3,
                "capacity": 5000,
                "status": Event.STATUS_PUBLISHED,
            },
            {
                "title": "AI & Machine Learning Workshop",
                "description": "Hands-on workshop covering practical machine learning techniques, deep learning frameworks, and real-world AI applications. Perfect for data scientists and ML engineers.",
                "days_from_now": 15,
                "duration_days": 2,
                "capacity": 300,
                "status": Event.STATUS_PUBLISHED,
            },
            {
                "title": "Cloud Native Indonesia Conference",
                "description": "Explore Kubernetes, Docker, microservices, and cloud-native architectures. Learn from industry experts and network with cloud professionals.",
                "days_from_now": 45,
                "duration_days": 2,
                "capacity": 2500,
                "status": Event.STATUS_PUBLISHED,
            },
            {
                "title": "Mobile Dev Fest Jakarta",
                "description": "Annual mobile development festival featuring iOS, Android, Flutter, and React Native. Discover the latest mobile technologies and best practices.",
                "days_from_now": 60,
                "duration_days": 2,
                "capacity": 1500,
                "status": Event.STATUS_PUBLISHED,
            },
            {
                "title": "Cybersecurity Summit",
                "description": "Comprehensive conference on information security, ethical hacking, and data protection. Essential for security professionals and IT managers.",
                "days_from_now": 20,
                "duration_days": 1,
                "capacity": 1000,
                "status": Event.STATUS_PUBLISHED,
            },
            {
                "title": "Frontend Developer Meetup",
                "description": "Monthly meetup for frontend developers. Topics include React, Vue, Angular, and modern JavaScript frameworks. Great for networking and learning.",
                "days_from_now": 7,
                "duration_days": 1,
                "capacity": 800,
                "status": Event.STATUS_PUBLISHED,
            },
            {
                "title": "Data Science Bootcamp",
                "description": "Intensive bootcamp covering data analysis, visualization, and predictive modeling. Includes hands-on projects with real datasets.",
                "days_from_now": 90,
                "duration_days": 5,
                "capacity": 200,
                "status": Event.STATUS_PUBLISHED,
            },
            {
                "title": "DevOps Indonesia 2025",
                "description": "Learn about CI/CD, infrastructure as code, monitoring, and automation. Connect with DevOps practitioners and share experiences.",
                "days_from_now": 75,
                "duration_days": 2,
                "capacity": 1800,
                "status": Event.STATUS_PUBLISHED,
            },
            {
                "title": "Blockchain & Web3 Conference",
                "description": "Explore blockchain technology, smart contracts, DeFi, and NFTs. Featuring speakers from leading blockchain projects.",
                "days_from_now": -10,
                "duration_days": 2,
                "capacity": 1200,
                "status": Event.STATUS_PUBLISHED,
            },
            {
                "title": "UX Design Workshop Bali",
                "description": "Master user experience design principles, design thinking, and prototyping. Create beautiful and functional user interfaces.",
                "days_from_now": 100,
                "duration_days": 3,
                "capacity": 150,
                "status": Event.STATUS_DRAFT,
            },
        ]

        # Get an organizer user (create one if doesn't exist)
        organizer = User.objects.filter(role=User.ORGANIZER).first()
        if not organizer:
            # Try to get any user
            organizer = User.objects.first()

        events = []
        for i, data in enumerate(events_data):
            days_from_now = data.pop("days_from_now")
            duration_days = data.pop("duration_days")

            start_time = now + timedelta(days=days_from_now)
            end_time = start_time + timedelta(days=duration_days)

            # Select venue based on capacity
            suitable_venues = [v for v in venues if v.capacity >= data["capacity"]]
            venue = random.choice(suitable_venues if suitable_venues else venues)

            title = data.pop("title")
            slug = slugify(title)

            # Make slug unique
            base_slug = slug
            counter = 1
            while Event.objects.filter(slug=slug).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1

            event = Event.objects.create(
                title=title,
                slug=slug,
                description=data.pop("description"),
                start_time=start_time,
                end_time=end_time,
                capacity=data.pop("capacity"),
                venue=venue,
                status=data.pop("status"),
                organizer=organizer,
                **data,
            )
            events.append(event)

        return events

    def create_tracks(self, event):
        """Create tracks for an event"""
        # Different track sets for different event types
        track_sets = [
            [
                {"name": "Main Stage", "description": "Keynotes and main presentations"},
                {
                    "name": "Technical Track",
                    "description": "Deep technical sessions and workshops",
                },
                {
                    "name": "Career Track",
                    "description": "Career development and soft skills",
                },
            ],
            [
                {
                    "name": "Frontend Track",
                    "description": "Frontend technologies and frameworks",
                },
                {
                    "name": "Backend Track",
                    "description": "Backend development and APIs",
                },
                {
                    "name": "Mobile Track",
                    "description": "Mobile app development",
                },
            ],
            [
                {"name": "Beginner Track", "description": "For those new to the field"},
                {
                    "name": "Advanced Track",
                    "description": "For experienced professionals",
                },
            ],
        ]

        # Select track set based on event duration
        if (event.end_time - event.start_time).days >= 3:
            selected_tracks = track_sets[0] + track_sets[1][:2]
        elif (event.end_time - event.start_time).days >= 2:
            selected_tracks = random.choice(track_sets)
        else:
            selected_tracks = track_sets[2]

        tracks = []
        for track_data in selected_tracks:
            track = Track.objects.create(event=event, **track_data)
            tracks.append(track)

        return tracks

    def create_sessions(self, event, speakers):
        """Create sessions for an event"""
        session_templates = [
            {"title": "Opening Keynote", "duration_hours": 1.5},
            {"title": "Workshop: Getting Started with {tech}", "duration_hours": 2},
            {"title": "Panel Discussion: The Future of {topic}", "duration_hours": 1},
            {"title": "Case Study: Building {product}", "duration_hours": 1},
            {"title": "Deep Dive: {tech} Best Practices", "duration_hours": 1.5},
            {"title": "Lightning Talks", "duration_hours": 1},
            {"title": "Hands-on Lab: {tech}", "duration_hours": 2},
            {"title": "Fireside Chat with {name}", "duration_hours": 0.75},
            {"title": "Closing Keynote", "duration_hours": 1},
        ]

        tech_topics = [
            "React",
            "Kubernetes",
            "Machine Learning",
            "TypeScript",
            "GraphQL",
            "Microservices",
            "Flutter",
            "Python",
            "Cloud Architecture",
            "Security",
        ]
        general_topics = [
            "Tech",
            "Development",
            "Innovation",
            "Digital Transformation",
        ]

        tracks = list(event.tracks.all())
        if not tracks:
            return []

        sessions = []
        
        # Calculate event duration in days
        event_duration = event.end_time - event.start_time
        days = event_duration.days if event_duration.days > 0 else 1

        # Create sessions per day per track
        for day in range(days):
            # Calculate day boundaries
            day_start = event.start_time + timedelta(days=day)
            day_start = day_start.replace(hour=9, minute=0, second=0, microsecond=0)
            
            # Day ends at 6 PM or event end time, whichever is earlier
            day_end_6pm = day_start.replace(hour=18, minute=0, second=0, microsecond=0)
            day_end = min(day_end_6pm, event.end_time)
            
            # Skip if day_start is already past event end
            if day_start >= event.end_time:
                continue
            
            # Ensure we don't start before event start time
            if day_start < event.start_time:
                day_start = event.start_time

            for track in tracks:
                current_time = day_start
                attempts = 0
                max_attempts = 10  # Prevent infinite loops
                successful_sessions = 0
                max_sessions_per_day = 4  # Limit sessions per track per day

                while current_time < day_end and successful_sessions < max_sessions_per_day and attempts < max_attempts:
                    attempts += 1
                    
                    template = random.choice(session_templates)
                    duration_hours = template["duration_hours"]

                    # Format title
                    title = template["title"]
                    if "{tech}" in title:
                        title = title.format(tech=random.choice(tech_topics))
                    elif "{topic}" in title:
                        title = title.format(topic=random.choice(general_topics))
                    elif "{product}" in title:
                        title = title.format(product="Scalable Systems")
                    elif "{name}" in title:
                        speaker = random.choice(speakers)
                        title = title.format(name=speaker.name.split()[0])

                    # Generate description
                    description = "An in-depth session covering key concepts and practical applications. Learn from industry experts and gain hands-on experience."

                    session_start = current_time
                    session_end = session_start + timedelta(hours=duration_hours)

                    # Validate session is within event boundaries
                    if session_start < event.start_time or session_end > event.end_time:
                        # Move forward and try again
                        current_time = current_time + timedelta(minutes=30)
                        continue
                    
                    # Check if session fits in the day
                    if session_end > day_end:
                        # No more room today for this track
                        break

                    # Select 1-2 random speakers
                    num_speakers = random.randint(1, min(2, len(speakers)))
                    session_speakers = random.sample(speakers, k=num_speakers)

                    try:
                        session = Session.objects.create(
                            event=event,
                            track=track,
                            title=title,
                            description=description,
                            start_time=session_start,
                            end_time=session_end,
                            room=f"Room {random.choice(['A', 'B', 'C', 'D'])}",
                        )
                        session.speakers.set(session_speakers)
                        sessions.append(session)
                        successful_sessions += 1

                        # Move to next time slot with 15 min break
                        current_time = session_end + timedelta(minutes=15)
                        attempts = 0  # Reset attempts after success
                        
                    except Exception:
                        # If creation fails, move forward by 30 minutes and try again
                        current_time = current_time + timedelta(minutes=30)

        return sessions

    def create_registrations(self, events):
        """Create mock registrations for events"""
        # Get attendee users
        attendees = list(User.objects.filter(role=User.ATTENDEE))

        if not attendees:
            self.stdout.write(
                self.style.WARNING(
                    "  ! No attendee users found. Skipping registration creation."
                )
            )
            return 0

        registrations_count = 0

        for event in events:
            # Only create registrations for published and past events
            if event.status != Event.STATUS_PUBLISHED:
                continue

            # Register 30-70% of capacity or available attendees
            max_registrations = min(
                int(event.capacity * random.uniform(0.3, 0.7)), len(attendees)
            )
            selected_attendees = random.sample(attendees, k=max_registrations)

            for attendee in selected_attendees:
                try:
                    Registration.objects.create(
                        event=event, attendee=attendee, status=Registration.STATUS_CONFIRMED
                    )
                    registrations_count += 1
                except:
                    # Skip if registration already exists
                    pass

            # Update registered count
            event.registered_count = event.registrations.filter(
                status=Registration.STATUS_CONFIRMED
            ).count()
            event.save(update_fields=["registered_count"])

        return registrations_count
