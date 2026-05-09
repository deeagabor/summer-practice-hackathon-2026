from django.urls import path
from . import views


urlpatterns = [
    path('', views.home, name='home'),

    path('events/', views.events, name='events'),
    path('events/create/', views.create_event, name='create_event'),

path(
    'events/',
    views.events,
    name='events'
),

path(
    'events/<uuid:eventId>/',
    views.event_detail,
    name='event_detail'
),

    path('chats/', views.chat, name='chats'),
    path('chat/<int:chatId>/', views.chat, name='chat'),

    path('profile/<str:username>/', views.profile, name='profile'),
    path('settings/', views.settings, name='settings'),

    # AUTH
    path('login/', views.login_view, name='login'),
    path('register/', views.register_view, name='register'),
    path('logout/', views.logout_view, name='logout'),
]