import uuid

from django.conf import settings
from django.contrib.postgres.constraints import ExclusionConstraint
from django.contrib.postgres.fields import DateTimeRangeField
from django.contrib.postgres.indexes import GistIndex
from django.core.exceptions import ValidationError
from django.db import models, transaction
from django.utils import timezone

User = settings.AUTH_USER_MODEL


class Venue(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=128)
    address = models.TextField(blank=True)
    capacity = models.PositiveIntegerField(null=True, blank=True)
    metadata = models.JSONField(default=dict, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class Event(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    STATUS_DRAFT = "draft"
    STATUS_PUBLISHED = "published"
    STATUS_CANCELLED = "cancelled"
    STATUS_CHOICES = [
        (STATUS_DRAFT, "Draft"),
        (STATUS_PUBLISHED, "Published"),
        (STATUS_CANCELLED, "Cancelled"),
    ]

    title = models.CharField(max_length=128)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    capacity = models.PositiveIntegerField()

    venue = models.ForeignKey(Venue, on_delete=models.PROTECT, related_name="events")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_DRAFT)
    metadata = models.JSONField(default=dict, blank=True)
    
    registered_count = models.PositiveIntegerField(default=0, editable=False)

    # organizer relationship - tie events to a user who manages them
    organizer = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="organized_events")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=["start_time"]),
            models.Index(fields=["status"]),
        ]

    def clean(self):
        if self.start_time >= self.end_time:
            raise ValidationError("event.start_time must be before event.end_time")
        
    # def get_total_registrations(self):
    #     return self.registrations.count(filter=models.Q(status=Registration.STATUS_CONFIRMED))

    def __str__(self):
        return self.title


class Track(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name="tracks")
    name = models.CharField(max_length=128)
    description = models.TextField(blank=True)

    class Meta:
        unique_together = ("event", "name")

    def __str__(self):
        return f"{self.event.title} :: {self.name}"


class Speaker(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=128)
    bio = models.TextField(blank=True)
    avatar_url = models.URLField(blank=True)
    contact_email = models.EmailField(blank=True)
    metadata = models.JSONField(default=dict, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class Session(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    """
    Session is scoped to an Event and a Track. To enforce non-overlap within a Track
    we keep a DateTimeRangeField `time_range` populated from start_time/end_time
    and add an ExclusionConstraint on (track, time_range) with operator '&&' (overlap).
    """

    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name="sessions")
    track = models.ForeignKey(Track, on_delete=models.CASCADE, related_name="sessions", blank=True, null=True)

    title = models.CharField(max_length=128)
    description= models.TextField(blank=True)

    start_time = models.DateTimeField()
    end_time = models.DateTimeField()

    # Range field used for exclusion constraint; not editable directly
    time_range = DateTimeRangeField(null=True, blank=True, editable=False, db_index=True)

    speakers = models.ManyToManyField(Speaker, related_name="sessions", blank=True)
    room = models.CharField(max_length=64, blank=True)
    metadata = models.JSONField(default=dict, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["start_time"]
        indexes = [
            models.Index(fields=["track", "start_time"]),
        ]
        constraints = [
            # Prevent overlapping sessions in the same track
            ExclusionConstraint(
                name="exclude_overlapping_sessions_in_track",
                expressions=[
                    ("track_id", "="),
                    ("time_range", "&&"),
                ],
                condition=models.Q(track__isnull=False)
            ),
        ]

    def clean(self):
        # basic validation
        if self.start_time >= self.end_time:
            raise ValidationError("Session start_time must be before end_time")

        # session must be within its event window
        if self.event:
            if self.start_time < self.event.start_time or self.end_time > self.event.end_time:
                raise ValidationError("Session must lie within the parent event's schedule")

    def save(self, *args, **kwargs):
        # set time_range from start/end so the DB exclusion constraint can work
        if self.start_time and self.end_time:
            # DateTimeRangeField accepts a (lower, upper) tuple; upper is exclusive by default
            self.time_range = (self.start_time, self.end_time)
        else:
            self.time_range = None
        # run full clean in save to raise model validation errors early (optional)
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.title} ({self.start_time.isoformat()} - {self.end_time.isoformat()})"


class Registration(models.Model):
    STATUS_CONFIRMED = "confirmed"
    STATUS_CANCELLED = "cancelled"
    STATUS_CHOICES = [
        (STATUS_CONFIRMED, "Confirmed"),
        (STATUS_CANCELLED, "Cancelled"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name="registrations")
    attendee = models.ForeignKey(User, on_delete=models.CASCADE, related_name="registrations")

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_CONFIRMED)
    created_at = models.DateTimeField(auto_now_add=True)
    canceled_at = models.DateTimeField(null=True, blank=True)
    metadata = models.JSONField(default=dict, blank=True)

    class Meta:
        unique_together = ("event", "attendee")
        indexes = [
            models.Index(fields=["event", "attendee"]),
            models.Index(fields=["status"]),
        ]

    def cancel(self):
        if self.status != self.STATUS_CANCELLED:
            with transaction.atomic():
                self.status = self.STATUS_CANCELLED
                self.canceled_at = timezone.now()
                self.save(update_fields=["status", "canceled_at"])
                self.event.registered_count = models.F("registered_count") - 1
                self.event.save(update_fields=["registered_count"])

    def __str__(self):
        return f"Registration({self.attendee}, {self.event}, {self.status})"

    @classmethod
    def create_atomic(cls, event_id, attendee):
        """
        Convenience helper for an atomic registration flow:
        - SELECT ... FOR UPDATE the event row
        - check capacity
        - insert registration (unique constraint prevents duplicates)
        - increment registered_count
        Returns Registration instance on success, raises ValidationError on failure.
        """
        from django.db import IntegrityError

        with transaction.atomic():
            # event_id is now a UUID
            ev = Event.objects.select_for_update().get(id=event_id)
            if ev.registered_count >= ev.capacity:
                raise ValidationError("Event capacity reached")

            # create registration; unique_together ensures duplicate prevention at DB level
            try:
                reg = cls.objects.create(event=ev, attendee=attendee, status=cls.STATUS_CONFIRMED)
            except IntegrityError:
                raise ValidationError("Attendee already registered for this event")

            # increment denormalized counter (kept safe by select_for_update)
            ev.registered_count = models.F("registered_count") + 1
            ev.save(update_fields=["registered_count"])
            
            # refresh the event object to resolve F() expression if caller needs the real value
            ev.refresh_from_db(fields=["registered_count"])
            return reg