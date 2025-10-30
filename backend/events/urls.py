from django.urls import include, path
from rest_framework.routers import DefaultRouter
from rest_framework_nested import routers

from .views import (EventViewSet, RegistrationViewSet, SessionViewSet,
                    SpeakerViewSet, TrackViewSet, VenueViewSet)

router = DefaultRouter(trailing_slash=False)
router.register(r'events', EventViewSet, basename='events')
router.register(r'speakers', SpeakerViewSet, basename='speakers')
router.register(r'venues', VenueViewSet, basename='venues')

events_router = routers.NestedDefaultRouter(router, r'events', lookup='event')
events_router.register(r'tracks', TrackViewSet, basename='event-tracks')
events_router.register(r'sessions', SessionViewSet, basename='event-sessions')
events_router.register(r'registrations', RegistrationViewSet, basename='event-registrations')

urlpatterns = [
    path(r'', include(router.urls)),
    path(r'', include(events_router.urls)),
]