from .models import SpotifyToken
from django.utils import timezone
from datetime import timedelta
from .credentials import CLIENT_ID, CLIENT_SECRET
from requests import post

# 2
def get_user_tokens(session_id):
    user_tokens = SpotifyToken.objects.filter(user=session_id)
    print(user_tokens)
    if user_tokens.exists():
        return user_tokens[0]
    else:

        return None


def update_or_create_user_tokens(
    session_id, access_token, token_type, expires_in, refresh_token
):

    tokens = get_user_tokens(session_id)

    # seconds were 'expires_in' but seconds takes only integer value
    expires_in = timezone.now() + timedelta(seconds=3600)

    # if have tokens => refresh them
    if tokens:
        tokens.access_token = access_token
        tokens.refresh_token = refresh_token
        tokens.expires_in = expires_in
        tokens.token_type = token_type
        tokens.save(
            update_fields=["acess_token", "refresh_token", "expires_in", "token_type"]
        )
    else:
        tokens = SpotifyToken(
            user=session_id,
            access_token=access_token,
            refresh_token=refresh_token,
            token_type=token_type,
            expires_in=expires_in,
        )

        print("tokens", session_id, access_token, refresh_token, token_type, expires_in)
        tokens.save()


# 1
def is_spotify_authenticated(session_id):
    tokens = get_user_tokens(session_id)
    if tokens:
        expiry = tokens.expires_in
        # if token expired
        if expiry <= timezone.now():
            refresh_spotify_token(session_id)

        return True
    return False


def refresh_spotify_token(session_id):
    refresh_token = get_user_tokens(session_id).refresh_token

    response = post(
        "https://accounts.spotify.com/api/token",
        data={
            "grant_type": "refresh_token",
            "refresh_token": refresh_token,
            "client_id": CLIENT_ID,
            "client_secret": CLIENT_SECRET,
        },
    ).json()

    access_token = response.get("access_token")
    token_type = response.get("token_type")
    expires_in = response.get("expires_in")
    refresh_token = response.get("refresh_token")

    print("token refresh response", response)

    update_or_create_user_tokens(
        session_id, access_token, token_type, expires_in, refresh_token
    )
