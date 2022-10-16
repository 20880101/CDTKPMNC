import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

// views
import About from "../containers/views/main/about";
import Home from "../containers/views/main/home";
import Login from "../containers/views/main/login/index";

// admin views
import Dashboard from "../containers/views/admin/dashboard";
import Setting from "../containers/views/admin/setting";

function AppRouters() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/admin" element={<Dashboard />} />
        <Route path="/admin/setting" element={<Setting />} />
        {/* <Route path="/" element={<Home />} /> */}
        <Route path="/about" element={<About />} />
      </Routes>
    </BrowserRouter>
  );
}
export default AppRouters;
