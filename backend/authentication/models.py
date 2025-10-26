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
    
    role = models.CharField(
        max_length=10,
        choices=ROLE_CHOICES,
        default=ATTENDEE,
    )
    
    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"
