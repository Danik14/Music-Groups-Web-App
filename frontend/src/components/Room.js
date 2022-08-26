import React, { useEffect } from "react";
import { useState } from "react";
import { useParams } from "react-router";
const Room = () => {
  let { roomCode } = useParams();
  const [votesToSkip, setVotesToSkip] = useState(2);
  const [guestCanPause, setGuestCanPause] = useState(false);
  // if current user if the host \/
  const [isHost, setIsHost] = useState(false);

  const getRoomDetails = async () => {
    await fetch("/api/get-room" + "?code=" + roomCode)
      .then((response) => response.json())
      .then((data) => {
        setVotesToSkip(data.votes_to_skip);
        setGuestCanPause(data.guest_can_pause);
        setIsHost(data.is_host);
      });
  };

  useEffect(() => {
    getRoomDetails();
  }, []);
  return (
    <div>
      <h3>{roomCode}</h3>
      <p>Votes: {votesToSkip}</p>
      <p>Guest Can Pause: {guestCanPause.toString()}</p>
      <p>Host: {isHost.toString()}</p>
    </div>
  );
};

export default Room;
