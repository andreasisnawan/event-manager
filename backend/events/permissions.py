from rest_framework import permissions


class IsOrganizerOrAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        # Implement logic: user has organizer role or is staff
        user = request.user
        return bool(user and (getattr(user, 'role', None) in ['organizer', 'admin']))

class IsOwnerOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
          
        # For registrations: allow owner (attendee.user) or admins
        user = request.user
        if getattr(obj, 'attendee', None):
            return obj.attendee == user or user.role == 'admin'
        return False