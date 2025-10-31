from datetime import datetime, timezone

from authentication.models import User
from django.shortcuts import get_object_or_404
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from .models import Event, Registration, Session, Speaker, Track, Venue
from .permissions import IsOrganizerOrAdmin, IsOwnerOrReadOnly
from .serializers import (EventSerializer, RegistrationSerializer,
                          SessionSerializer, SpeakerSerializer,
                          TrackSerializer, VenueSerializer)


class EventViewSet(viewsets.ModelViewSet):
    serializer_class = EventSerializer
    permission_classes = [IsOrganizerOrAdmin]

    def get_queryset(self):
        user = self.request.user
        base_queryset = Event.objects.select_related('venue').all()

        # Admin and organizers can see all events
        if user.is_authenticated and user.role in [User.ADMIN, User.ORGANIZER]:
            return base_queryset
        
        # Unauthenticated users and regular users (attendees) can only see published events
        return base_queryset.filter(status=Event.STATUS_PUBLISHED)

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsOrganizerOrAdmin()]
        return super().get_permissions()

    @action(detail=True, methods=['get'])
    def availability(self, request, pk=None):
        event = self.get_object()
        return Response({
            'capacity': event.capacity,
            'registered_count': event.registered_count,
            'remaining': max(event.capacity - event.registered_count, 0)
        })

class TrackViewSet(viewsets.ModelViewSet):
    serializer_class = TrackSerializer
    permission_classes = [IsOrganizerOrAdmin]

    def get_queryset(self):
        event_id = self.kwargs.get('event_pk')
        return Track.objects.filter(event_id=event_id)

    def perform_create(self, serializer):
        event = get_object_or_404(Event, pk=self.kwargs.get('event_pk'))
        serializer.save(event=event)
        
class SpeakerViewSet(viewsets.ModelViewSet):
    queryset = Speaker.objects.all()
    serializer_class = SpeakerSerializer
    permission_classes = [IsOrganizerOrAdmin]
    
    def get_queryset(self):
        return Speaker.objects.all()

class VenueViewSet(viewsets.ModelViewSet):
    queryset = Venue.objects.all()
    serializer_class = VenueSerializer
    permission_classes = [IsOrganizerOrAdmin]
    
    def get_queryset(self):
        return Venue.objects.all()
    
    @action(detail=False, methods=['get'], permission_classes=[AllowAny], url_path='city-choices')
    def city_choices(self, request):
        """Return available city choices for venue selection"""
        choices = [{"value": choice[0], "label": choice[1]} for choice in Venue.CITY_CHOICES]
        return Response(choices)

class SessionViewSet(viewsets.ModelViewSet):
    serializer_class = SessionSerializer
    permission_classes = [IsOrganizerOrAdmin]

    def get_queryset(self):
        event_id = self.kwargs.get('event_pk')
        return Session.objects.filter(event_id=event_id).prefetch_related('speakers')

    def perform_create(self, serializer):
        # extra validation for overlaps happens in serializer.clean or DB constraint
        event = get_object_or_404(Event, pk=self.kwargs.get('event_pk'))
        serializer.save(event=event)

class RegistrationViewSet(viewsets.ModelViewSet):
    queryset = Registration.objects.select_related("attendee")
    serializer_class = RegistrationSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrReadOnly]

    def get_queryset(self):
        event_id = self.kwargs.get('event_pk')
        qs = Registration.objects.filter(event_id=event_id)
        
        # organizers/admins can see all, others only their own
        user = self.request.user
        if getattr(user, 'role', None) in ['admin', 'organizer']:
            return qs
        
        try:
            return qs.filter(attendee=user)
        except:
            return Registration.objects.none()

    def perform_destroy(self, instance):
        # treat destroy as cancel: decrement with locks
        from django.db import transaction
        with transaction.atomic():
            ev = Event.objects.select_for_update().get(pk=instance.event.pk)
            if instance.status != 'cancelled':
                instance.status = 'cancelled'
                instance.canceled_at = datetime.now(timezone.utc)
                instance.save()
                ev.registered_count = max(ev.registered_count - 1, 0)
                ev.save(update_fields=['registered_count'])