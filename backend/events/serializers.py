from django.contrib.auth import get_user_model
from django.db import IntegrityError, transaction
from rest_framework import serializers

from .models import Event, Registration, Session, Speaker, Track, Venue

User = get_user_model()


class VenueSerializer(serializers.ModelSerializer):
    class Meta:
        model = Venue
        fields = '__all__'

class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        read_only_fields = ('registered_count', 'created_at', 'updated_at')
        fields = '__all__'

    def create(self, validated_data):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            if request.user.role == 'organizer' and 'organizer' not in validated_data:
                # Set organizer to current user if not specified
                validated_data['organizer'] = request.user
            elif request.user.role != 'admin' and 'organizer' in validated_data:
                # Only admin can set a different organizer
                raise serializers.ValidationError({"organizer": "Only admin users can set the organizer field"})
        return super().create(validated_data)

    def validate(self, data):
        # Ensure end_time > start_time
        start = data.get('start_time', getattr(self.instance, 'start_time', None))
        end = data.get('end_time', getattr(self.instance, 'end_time', None))
        
        if start and end and start >= end:
            raise serializers.ValidationError("Event end_time must be after start_time")
        return data

class TrackSerializer(serializers.ModelSerializer):
    class Meta:
        model = Track
        fields = '__all__'
        read_only_fields = ['event']

class SessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Session
        fields = '__all__'
        read_only_fields = ['event']

    def validate(self, data):
        # ensure session inside event and start < end
        start = data.get('start_time', getattr(self.instance, 'start_time', None))
        end = data.get('end_time', getattr(self.instance, 'end_time', None))
        event = data.get('event', getattr(self.instance, 'event', None))
        
        if start and end and start >= end:
            raise serializers.ValidationError("start_time must be before end_time")
        if event and start and end:
            if start < event.start_time or end > event.end_time:
                raise serializers.ValidationError("Session times must be inside parent event times")
        return data

class SpeakerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Speaker
        fields = '__all__'

class VenueSerializer(serializers.ModelSerializer):
    class Meta:
        model = Venue
        fields = '__all__'

class RegistrationSerializer(serializers.ModelSerializer):
    attendee_name = serializers.CharField(source="attendee.get_full_name", read_only=True)
    
    class Meta:
        model = Registration
        fields = ('id', 'event', 'attendee', 'attendee_name', 'status', 'canceled_at', 'created_at', 'metadata')
        read_only_fields = ('id', 'created_at', 'canceled_at', 'event', 'attendee')
        extra_kwargs = {
            "attendee": {"required": False}  # attendee not required for normal users
        }

    def create(self, validated_data):
        request = self.context['request']
        
        if "attendee" not in validated_data:
            validated_data["attendee"] = request.user
        else:
            if not request.user.role in ['admin', 'organizer']:
                raise serializers.ValidationError("Only admins can assign attendee.")

        event_pk = self.context['view'].kwargs.get('event_pk')
        try:
            event = Event.objects.get(pk=event_pk)
        except Event.DoesNotExist:
            raise serializers.ValidationError({"event": "Event not found"})
        
        # concurrency-safe registration
        from django.db import transaction
        from django.db.models import F

        with transaction.atomic():
            # lock the event row
            ev = Event.objects.select_for_update().get(pk=event.pk)
            if ev.registered_count >= ev.capacity:
                raise serializers.ValidationError({"non_field_errors": ["Event capacity reached"]})
            try:
                # Check for existing registration
                existing_reg = Registration.objects.filter(
                    event=ev,
                    attendee=validated_data['attendee']
                ).first()

                if existing_reg:
                    if existing_reg.status == 'cancelled':
                        # Reactivate cancelled registration
                        existing_reg.status = validated_data.get('status', 'confirmed')
                        existing_reg.canceled_at = None
                        existing_reg.metadata = {
                            **existing_reg.metadata,  # Keep existing metadata
                            **validated_data.get('metadata', {})  # Update with new metadata
                        }
                        existing_reg.save()
                        # Increment count since this is effectively a new registration
                        ev.registered_count = F('registered_count') + 1
                        ev.save(update_fields=['registered_count'])
                        ev.refresh_from_db(fields=['registered_count'])
                        return existing_reg
                    else:
                        raise serializers.ValidationError({"non_field_errors": ["Already registered and active"]})

                # Create new registration if no existing one found
                validated_data['event'] = ev
                reg = Registration.objects.create(**validated_data)
                
                # increment count for new registration
                ev.registered_count = F('registered_count') + 1
                ev.save(update_fields=['registered_count'])
                # refresh ev to avoid F expression
                ev.refresh_from_db(fields=['registered_count'])
                return reg

            except IntegrityError:
                raise serializers.ValidationError({"non_field_errors": ["Registration failed due to database constraints"]})