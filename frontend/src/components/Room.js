import React, { useEffect } from "react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Grid, Button, Typography } from "@material-ui/core";
import CreateRoomPage from "./CreateRoomPage";
import MusicPlayer from "./MusicPlayer";

const Room = ({ codeOfRoom, clearRoomCode }) => {
  const [votesToSkip, setVotesToSkip] = useState(2);
  const [guestCanPause, setGuestCanPause] = useState(false);
  // if current user is the host \/
  const [isHost, setIsHost] = useState(false);
  let [roomCode, setRoomCode] = useState(
    codeOfRoom ? codeOfRoom : useParams().roomCode
  );
  let [showSettings, setShowSettings] = useState(false);
  let [spotifyAuthenticated, setSpotifyAuthenticated] = useState(false);
  let [song, setSong] = useState({});

  const navigate = useNavigate();

  const getRoomDetails = async () => {
    await fetch("/api/get-room" + "?code=" + roomCode)
      .then((response) => {
        {
          if (!response.ok) {
            navigate("/");
            return;
          }
          return response.json();
        }
      })
      .then((data) => {
        setVotesToSkip(data.votes_to_skip);
        setGuestCanPause(data.guest_can_pause);
        setIsHost(data.is_host); //idk y but it doest change state
        console.log("details", data);
        if (data.is_host) {
          console.log(1);
          authenticateSpotify();
        }
      })
      .catch((error) => {
        navigate("/");
        return;
      });
  };

  const authenticateSpotify = () => {
    fetch("/spotify/is-authenticated")
      .then((response) => response.json())
      .then((data) => {
        setSpotifyAuthenticated(data.status);
        console.log(data.status);
        if (!data.status) {
          fetch("/spotify/get-auth-url")
            .then((response) => response.json())
            .then((data) => {
              window.location.replace(data.url);
            });
        }
      })
      .catch((error) => console.log(error));
  };

  const getCurrentSong = () => {
    fetch("/spotify/current-song")
      .then((response) => {
        if (!response.ok) {
          return {};
        } else {
          return response.json();
        }
      })
      .then((data) => {
        setSong(data);
        console.log("song", data);
      });
  };

  const updateShowSettings = (value) => {
    setShowSettings(value);
  };

  const renderSettings = () => {
    return (
      <Grid container spacing={1}>
        <Grid item xs={12} align="center">
          <CreateRoomPage
            update={true}
            votesToSkipCurrent={votesToSkip}
            guestCanPauseCurrent={guestCanPause}
            roomCode={roomCode}
            updateCallback={getRoomDetails}
          />
        </Grid>
        <Grid item xs={12} align="center">
          <Button
            variant="contained"
            color="secondary"
            onClick={() => updateShowSettings(false)}
          >
            Close
          </Button>
        </Grid>
      </Grid>
    );
  };

  const renderSettingsButton = () => {
    return (
      <Grid item xs={12} align="center">
        <Button
          variant="contained"
          color="primary"
          onClick={() => updateShowSettings(true)}
        >
          Settings
        </Button>
      </Grid>
    );
  };

  const leaveButtonPressed = () => {
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    };
    fetch("/api/leave-room", requestOptions).then((response) => {
      console.log("res", response);
      clearRoomCode();
      navigate("/");
    });
  };

  useEffect(() => {
    getRoomDetails();
    let interval = setInterval(getCurrentSong, 1000);
    return () => {
      // Anything in here is fired on component unmount.
      clearInterval(interval);
    };
  }, []);

  return showSettings ? (
    renderSettings()
  ) : (
    <Grid container spacing={1}>
      <Grid item xs={12} align="center">
        <Typography variant="h4" component="h4">
          Code: {roomCode}
        </Typography>
      </Grid>
      <MusicPlayer {...song} />
      {isHost ? renderSettingsButton() : null}
      <Grid item xs={12} align="center">
        <Button
          variant="contained"
          color="secondary"
          onClick={leaveButtonPressed}
        >
          Leave Room
        </Button>
      </Grid>
    </Grid>
  );
};

export default Room;
