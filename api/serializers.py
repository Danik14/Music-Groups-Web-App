from rest_framework import serializers
from .models import Room


class RoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room
        fields = "__all__"


# this serializer is for making sure post request contains correct data
class CreateRoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room
        fields = ("guest_can_pause", "votes_to_skip")
