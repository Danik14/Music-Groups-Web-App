from os import stat
from django.http import HttpResponse, JsonResponse
from django.shortcuts import render
from rest_framework import generics, status
from .models import Room
from .serializers import RoomSerializer, CreateRoomSerializer, UpdateRoomSerializer
from rest_framework.views import APIView
from rest_framework.response import Response


class RoomView(generics.ListAPIView):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer


class CreateRoomView(APIView):
    serializer_class = CreateRoomSerializer

    def post(self, request, format=None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()

        # serializes data to python format
        serializer = self.serializer_class(data=request.data)

        # if those two fields are valid then create room
        if serializer.is_valid():
            guest_can_pause = serializer.data.get("guest_can_pause")
            votes_to_skip = serializer.data.get("votes_to_skip")
            host = self.request.session.session_key
            queryset = Room.objects.filter(host=host)

            # check if such user already has a room
            # if so => just update settings of current room
            if queryset.exists():
                room = queryset[0]
                room.guest_can_pause = guest_can_pause
                room.votes_to_skip = votes_to_skip
                room.save(update_fields=["guest_can_pause", "votes_to_skip"])
                self.request.session["room_code"] = room.code
                return Response(RoomSerializer(room).data, status=status.HTTP_200_OK)
            else:
                room = Room(
                    host=host,
                    guest_can_pause=guest_can_pause,
                    votes_to_skip=votes_to_skip,
                )
                room.save()
                self.request.session["room_code"] = room.code
                return Response(
                    RoomSerializer(room).data, status=status.HTTP_201_CREATED
                )

        return Response(
            {"Bad Request": "Invalid data..."}, status=status.HTTP_400_BAD_REQUEST
        )


class GetRoom(APIView):
    serializer_class = RoomSerializer
    # when we want to 'get' room we have
    # to pass a parameter called 'code'
    lookup_url_kwarg = "code"

    def get(self, request, format=None):
        #'GET' gives info about url
        # with .get we looking for any parameters
        # speicifically that matches the name 'code' in url string
        code = request.GET.get(self.lookup_url_kwarg)
        if code != None:
            room = Room.objects.filter(code=code)
            if len(room) > 0:
                data = RoomSerializer(room[0]).data
                # check if user is the host
                data["is_host"] = self.request.session.session_key == room[0].host
                print(data)
                return Response(data, status=status.HTTP_200_OK)
            return Response(
                {"Room Not Found": "Invalid Room Code."},
                status=status.HTTP_404_NOT_FOUND,
            )
        return Response(
            {"Bad Request": "Code parameter not found in request"},
            status=status.HTTP_400_BAD_REQUEST,
        )


class JoinRoom(APIView):
    lookup_url_kwarg = "code"

    def post(self, request, format=None):
        # if this user has no active session => create one
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()

        code = request.data.get(self.lookup_url_kwarg)

        if code != None:
            room_result = Room.objects.filter(code=code)
            if len(room_result) > 0:
                room = room_result[0]
                # save info that current user is in this room
                # we create kind of tempory storage obejct
                # that's called 'room code' with a value of 'code'
                # this will be store like a session key
                self.request.session["room_code"] = code
                return Response({"message": "Room Joined!"}, status=status.HTTP_200_OK)
            return Response(
                {"Bad Request": "Invalid Room Code"}, status=status.HTTP_400_BAD_REQUEST
            )

        return Response(
            {"Bad Request": "Invalid post data, did not find a code key"},
            status=status.HTTP_400_BAD_REQUEST,
        )


class UserInRoom(APIView):
    def get(self, request, format=None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()

        data = {
            # taking room code from session
            "code": self.request.session.get("room_code")
        }

        return JsonResponse(data, status=status.HTTP_200_OK)


class LeaveRoom(APIView):
    def post(self, request, format=None):
        if "room_code" in self.request.session:
            # delete room code
            self.request.session.pop("room_code")
            # if host leaves => room is deleted
            host_id = self.request.session.session_key
            room_results = Room.objects.filter(host=host_id)
            if len(room_results) > 0:
                room = room_results[0]
                room.delete()

        return Response({"Message": "Success"}, status=status.HTTP_200_OK)


class UpdateRoom(APIView):
    # use patch when updating something
    serializer_class = UpdateRoomSerializer

    def patch(self, request, format=None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()

        print(request)

        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            guest_can_pause = serializer.data.get("guest_can_pause")
            votes_to_skip = serializer.data.get("votes_to_skip")
            code = serializer.data.get("code")

            queryset = Room.objects.filter(code=code)

            if not queryset.exists():
                return Response(
                    {"Message": "Room Not Found"}, status=status.HTTP_404_NOT_FOUND
                )

            room = queryset[0]
            user_id = self.request.session.session_key
            if room.host != user_id:
                return Response(
                    {"Message": "You are not the host of this room"},
                    status=status.HTTP_403_FORBIDDEN,
                )

            room.guest_can_pause = guest_can_pause
            room.votes_to_skip = votes_to_skip
            room.save(update_fields=["guest_can_pause", "votes_to_skip"])
            return Response(RoomSerializer(room).data, status=status.HTTP_200_OK)

        return Response(
            {"Bad Request": "Invalid Data"}, status=status.HTTP_400_BAD_REQUEST
        )
