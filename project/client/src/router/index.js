import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

// views
import About from "../containers/views/main/about";
import Home from "../containers/views/main/home";
import Login from "../containers/views/main/login/index";

// user views
import User from "../containers/views/user/";
// driver views
import Driver from "../containers/views/driver";

// admin views
import Dashboard from "../containers/views/admin/dashboard";
import Setting from "../containers/views/admin/setting";

function AppRouters() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/user" element={<User />} />
        <Route path="/driver" element={<Driver />} />

        <Route path="/admin" element={<Dashboard />} />
        <Route path="/admin/setting" element={<Setting />} />

        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </BrowserRouter>
  );
}
export default AppRouters;
