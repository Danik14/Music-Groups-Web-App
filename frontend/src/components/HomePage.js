import React, { Component } from "react";
import RoomJoinPage from "./RoomJoinPage";
import CreateRoomPage from "./CreateRoomPage";
import { BrowserRouter, Link, Navigate, Route, Routes } from "react-router-dom";
import Room from "./Room";
import { Grid, Button, ButtonGroup, Typography } from "@material-ui/core";

export default class HomePage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      roomCode: null,
    };
  }

  async componentDidMount() {
    fetch("/api/user-in-room")
      .then((response) => response.json())
      .then((data) => {
        this.setState({
          roomCode: data.code,
        });
      })
      .catch((error) => console.log(error));
  }

  clearRoomCode() {
    this.setState({ roomCode: null });
  }

  render() {
    return (
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            exact
            element={
              <ProtectedRoute roomCode={this.state.roomCode}>
                <Navigate to={`/room/${this.state.roomCode}`} />
              </ProtectedRoute>
            }
          />

          <Route path="/join" element={<RoomJoinPage />}></Route>
          <Route path="/create" element={<CreateRoomPage />}></Route>
          <Route path="/room/:roomCode" element={<Room />} />
        </Routes>
      </BrowserRouter>
    );
  }
}
const ProtectedRoute = ({ roomCode, children }) => {
  if (!roomCode) {
    return (
      <Grid container spacing={3}>
        <Grid item xs={12} align="center">
          <Typography variant="h3" compact="h3">
            House Party
          </Typography>
        </Grid>
        <Grid item xs={12} align="center">
          <ButtonGroup disableElevation variant="contained" color="primary">
            <Button color="primary" to="/join" component={Link}>
              Join a Room
            </Button>
            <Button color="secondary" to="/create" component={Link}>
              Create a Room
            </Button>
          </ButtonGroup>
        </Grid>
      </Grid>
    );
  }

  return children;
};
