import React, { useState, useEffect } from "react";
import { render } from "react-dom";
import HomePage from "./HomePage";
import { BrowserRouter, Link, Navigate, Route, Routes } from "react-router-dom";
import RoomJoinPage from "./RoomJoinPage";
import CreateRoomPage from "./CreateRoomPage";
import Room from "./Room";

export default function App() {
  const [roomCode, setRoomCode] = useState(null);

  useEffect(() => {
    fetch("/api/user-in-room")
      .then((response) => response.json())
      .then((data) => {
        setRoomCode(data.code);
        console.log("user in room data", data);
      })
      .catch((error) => console.log(error));
  }, []);

  const clearRoomCode = () => {
    setRoomCode(null);
  };

  return (
    <div className="center">
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            exact
            element={
              <ProtectedRoute roomCode={roomCode}>
                <Room codeOfRoom={roomCode} clearRoomCode={clearRoomCode} />
              </ProtectedRoute>
            }
          />

          <Route path="/join" element={<RoomJoinPage />}></Route>
          <Route path="/create" element={<CreateRoomPage />}></Route>
          <Route
            path="/room/:roomCode"
            element={<Room clearRoomCode={clearRoomCode} />}
          />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

const ProtectedRoute = ({ roomCode, children }) => {
  if (!roomCode) {
    return <HomePage />;
  }

  return children;
};

import { createRoot } from "react-dom/client";
const container = document.getElementById("app");
const root = createRoot(container); // createRoot(container!) if you use TypeScript
root.render(<App tab="home" />);

// render(<App />, appDiv);
