import uuid

from django.contrib.auth.models import User
from django.db import models


class Profile(models.Model):

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE
    )

    avatar = models.ImageField(
        upload_to='avatars/',
        default='avatars/default.png'
    )

    bio = models.TextField(blank=True)


class Sport(models.Model):

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE
    )

    name = models.CharField(max_length=50)

    level = models.CharField(max_length=30)


class Event(models.Model):

    event_id = models.UUIDField(
        default=uuid.uuid4,
        editable=False,
        unique=True
    )

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE
    )

    participants = models.ManyToManyField(
        User,
        related_name="joined_events",
        blank=True
    )

    sport = models.CharField(max_length=50)

    team_size = models.CharField(max_length=20)

    venue = models.CharField(max_length=100)

    start_time = models.DateTimeField()

    duration_hours = models.IntegerField()

    created_at = models.DateTimeField(auto_now_add=True)


class ChatRoom(models.Model):

    room_id = models.UUIDField(
        default=uuid.uuid4,
        editable=False,
        unique=True
    )

    event = models.OneToOneField(
        Event,
        on_delete=models.CASCADE
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )


class ChatMessage(models.Model):

    room = models.ForeignKey(
        ChatRoom,
        on_delete=models.CASCADE,
        related_name="messages"
    )

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE
    )

    message = models.TextField()

    created_at = models.DateTimeField(
        auto_now_add=True
    )