import React, { Component } from "react";
import RoomJoinPage from "./RoomJoinPage";
import CreateRoomPage from "./CreateRoomPage";
import {
  BrowserRouter,
  Link,
  Redirect,
  Switch,
  Route,
  Routes,
} from "react-router-dom";

export default class HomePage extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<p>This is the home page</p>} />

          <Route path="/join" element={<RoomJoinPage />}></Route>
          <Route path="/create" element={<CreateRoomPage />}></Route>
        </Routes>
      </BrowserRouter>
    );
  }
}
