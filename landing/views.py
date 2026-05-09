from django.shortcuts import (
    render,
    redirect,
    get_object_or_404
)

from .models import (
    Profile,
    Sport,
    Event,
    ChatRoom,
    ChatMessage
)

from django.contrib.auth.models import User

from django.contrib import messages

from django.utils.dateparse import parse_datetime

from .models import (
    Profile,
    Sport,
    Event
)


# HOME
def home(request):

    return render(
        request,
        'public/index.html'
    )


# EVENT DETAIL
def event_detail(request, eventId):

    # LOGIN REQUIRED
    if not request.user.is_authenticated:

        return redirect('login')

    # EVENT
    event = get_object_or_404(
        Event,
        event_id=eventId
    )

    # TEAM SIZE
    # 2v2 -> 4
    # 3v3 -> 6
    split = (
        event.team_size
        .lower()
        .split("v")
    )

    max_players = (
        int(split[0]) +
        int(split[1])
    )

    # PARTICIPANTS
    participants = (
        event.participants.all()
    )

    # INCLUDE CREATOR
    all_players = [
        event.user
    ] + list(participants)

    # PLAYER COUNT
    current_players = len(
        all_players
    )

    # CHECK IF USER JOINED
    user_joined = (
        request.user == event.user
        or
        participants.filter(
            id=request.user.id
        ).exists()
    )

    # EVENT FULL
    event_full = (
        current_players >= max_players
    )

    # POST ACTIONS
    if request.method == "POST":

        action = request.POST.get(
            "action"
        )

        # JOIN EVENT
        if (
            action == "join_event"
            and not user_joined
            and not event_full
        ):

            event.participants.add(
                request.user
            )

            messages.success(
                request,
                "You joined the event."
            )

        # LEAVE EVENT
        elif (
            action == "leave_event"
            and request.user != event.user
        ):

            event.participants.remove(
                request.user
            )

            messages.success(
                request,
                "You left the event."
            )

        return redirect(
            'event_detail',
            eventId=event.event_id
        )

    return render(
        request,
        'public/eventDetail.html',
        {
            "event": event,

            "all_players": all_players,

            "current_players":
                current_players,

            "max_players":
                max_players,

            "user_joined":
                user_joined,

            "event_full":
                event_full
        }
    )


# EVENTS PAGE
def events(request):

    all_events = (
        Event.objects
        .all()
        .order_by("-created_at")
    )

    return render(
        request,
        'public/eventsView.html',
        {
            "events": all_events
        }
    )


# CHAT
def chat(request, chatId):

    return render(
        request,
        'public/chat.html',
        {
            'chatId': chatId
        }
    )


# PROFILE
def profile(request, username):

    user = get_object_or_404(
        User,
        username=username
    )

    profile, _ = (
        Profile.objects.get_or_create(
            user=user
        )
    )

    sports = (
        Sport.objects.filter(
            user=user
        )
    )

    return render(
        request,
        'public/profileView.html',
        {
            'profile_user': user,
            'profile': profile,
            'sports': sports
        }
    )


# SETTINGS
def settings(request):

    if not request.user.is_authenticated:

        return redirect('login')

    profile, _ = (
        Profile.objects.get_or_create(
            user=request.user
        )
    )

    all_sports = [

        "Football",
        "Basketball",
        "Tennis",
        "Volleyball",
        "Swimming",
        "Gym",
        "Running",
        "Cycling",
        "Badminton",
        "Table Tennis"

    ]

    if request.method == "POST":

        action = request.POST.get(
            "action"
        )

        # PROFILE
        if action == "profile":

            request.user.username = (
                request.POST.get(
                    "username"
                )
            )

            request.user.email = (
                request.POST.get(
                    "email"
                )
            )

            request.user.save()

            profile.bio = (
                request.POST.get("bio")
            )

            if request.FILES.get(
                "avatar"
            ):

                profile.avatar = (
                    request.FILES[
                        "avatar"
                    ]
                )

            profile.save()

        # ADD SPORT
        elif action == "add_sport":

            sport = request.POST.get(
                "sport"
            )

            level = request.POST.get(
                "level"
            )

            if sport:

                exists = (
                    Sport.objects.filter(
                        user=request.user,
                        name=sport
                    ).exists()
                )

                if not exists:

                    Sport.objects.create(
                        user=request.user,
                        name=sport,
                        level=level
                    )

        # REMOVE SPORT
        elif action == "remove_sport":

            sport_id = request.POST.get(
                "sport_id"
            )

            Sport.objects.filter(
                id=sport_id,
                user=request.user
            ).delete()

        return redirect(
            'settings'
        )

    return render(
        request,
        'public/profileSettings.html',
        {
            'profile': profile,

            'sports':
                Sport.objects.filter(
                    user=request.user
                ),

            'all_sports':
                all_sports
        }
    )


# CREATE EVENT
def create_event(request):

    if not request.user.is_authenticated:

        return redirect('login')

    if request.method == "POST":

        action = request.POST.get(
            "action"
        )

        if action == "create_event":

            sport = request.POST.get(
                "sport"
            )

            team_size = request.POST.get(
                "team_size"
            )

            venue = request.POST.get(
                "venue"
            )

            start_time_raw = (
                request.POST.get(
                    "start_time"
                )
            )

            start_time = parse_datetime(
                start_time_raw
            )

            duration_hours = (
                request.POST.get(
                    "duration_hours"
                )
            )

            # VALIDATION
            if not all([

                sport,
                team_size,
                venue,
                start_time,
                duration_hours

            ]):

                messages.error(
                    request,
                    "Please complete all fields."
                )

                return redirect(
                    'create_event'
                )

            # CREATE EVENT
            event = Event.objects.create(

                user=request.user,

                sport=sport,

                team_size=team_size,

                venue=venue,

                start_time=start_time,

                duration_hours=int(
                    duration_hours
                )

            )

            event = Event.objects.create(
                user=request.user,
                sport=sport,
                team_size=team_size,
                venue=venue,
                start_time=start_time,
                duration_hours=int(duration_hours)
            )

            # OWNER AUTO JOINS
            event.participants.add(request.user)

            # CREATE CHAT ROOM
            ChatRoom.objects.create(
                event=event
            )


            messages.success(
                request,
                "Event created successfully."
            )

            return redirect(
                'event_detail',
                eventId=event.event_id
            )

    return render(
        request,
        'public/eventsCreate.html'
    )


# LOGIN
def login_view(request):

    if request.method == "POST":

        username = request.POST.get(
            "username"
        )

        password = request.POST.get(
            "password"
        )

        user = authenticate(

            request,

            username=username,

            password=password

        )

        if user:

            login(
                request,
                user
            )

            return redirect(
                'settings'
            )

        messages.error(

            request,

            "Wrong username or password"

        )

        return redirect(
            'login'
        )

    return render(
        request,
        'public/auth.html'
    )


# REGISTER
def register_view(request):

    if request.method == "POST":

        username = request.POST.get(
            "username"
        )

        email = request.POST.get(
            "email"
        )

        password = request.POST.get(
            "password"
        )

        if User.objects.filter(
            username=username
        ).exists():

            messages.error(

                request,

                "Username already exists"

            )

            return redirect(
                'register'
            )

        user = User.objects.create_user(

            username=username,

            email=email,

            password=password

        )

        Profile.objects.create(
            user=user
        )

        login(
            request,
            user
        )

        return redirect(
            'settings'
        )

    return render(
        request,
        'public/auth.html'
    )


# LOGOUT
def logout_view(request):

    logout(request)

    return redirect('home')