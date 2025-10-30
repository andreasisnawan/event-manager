import uuid

from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    ADMIN = 'admin'
    ATTENDEE = 'attendee'
    ORGANIZER = 'organizer'
    
    ROLE_CHOICES = [
        (ADMIN, 'Admin'),
        (ATTENDEE, 'Attendee'),
        (ORGANIZER, 'Organizer'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False, verbose_name='ID')
    role = models.CharField(
        max_length=10,
        choices=ROLE_CHOICES,
        default=ATTENDEE,
    )
    
    def get_full_name(self):
        full_name = f"{self.first_name} {self.last_name}".strip()
        return full_name if full_name else self.username
    
    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"
