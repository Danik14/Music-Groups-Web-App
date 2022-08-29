from django.contrib import admin
from django.urls import path
from .views import index

# for cross-app redirection
app_name = "frontend"

urlpatterns = [
    path("", index, name=""),
    path("join", index),
    path("create", index),
    path("room/<str:roomCode>", index),
]
