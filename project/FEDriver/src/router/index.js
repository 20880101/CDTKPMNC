import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

// views
import About from "../containers/views/main/about";
import Home from "../containers/views/main/home";
import Login from "../containers/views/main/login/index";

// driver views
import Driver from "../containers/views/driver";

function AppRouters() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/driver" element={<Driver />} />
        {/* <Route path="/" element={<Home />} /> */}
        <Route path="/about" element={<About />} />
      </Routes>
    </BrowserRouter>
  );
}
export default AppRouters;
