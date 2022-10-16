import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

// views
import About from "../containers/views/main/about";
import Home from "../containers/views/main/home";
import Login from "../containers/views/main/login/index";

// user views
import User from "../containers/views/user/";

function AppRouters() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/user" element={<User />} />
        {/* <Route path="/" element={<Home />} /> */}
        <Route path="/about" element={<About />} />
      </Routes>
    </BrowserRouter>
  );
}
export default AppRouters;
