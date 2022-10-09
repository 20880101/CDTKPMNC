import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import Main from "../containers/layouts/main";
import MainAdmin from "../containers/layouts/mainAdmin";

// views
import About from "../containers/views/main/about";
import Home from "../containers/views/main/home";
import Login from "../containers/views/main/login";

// admin Views

import Dashboard from "../containers/views/admin/dashboard";
import Setting from "../containers/views/admin/setting";

function AppRouters() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route path="/admin" exact component={<Dashboard />} />
        <Route path="/admin/setting" component={<Setting />} />

        <Route path="/home" exact component={<Home />} />
        <Route path="/about" component={<About />} />
      </Routes>
    </BrowserRouter>
  );
}
export default AppRouters;
