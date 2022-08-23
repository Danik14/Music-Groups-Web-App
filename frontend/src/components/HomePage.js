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

import { createRoot } from "react-dom/client";
//const container = document.getElementById("app");
//const root = createRoot(container); // createRoot(container!) if you use TypeScript

export default class HomePage extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <BrowserRouter>
        <Routes>
          <Route exact path="/"></Route>
          <Route path="/join" element={<RoomJoinPage />}></Route>
          <Route path="/create" element={<CreateRoomPage />}></Route>
        </Routes>
      </BrowserRouter>
    );
  }
}
