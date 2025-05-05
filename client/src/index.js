import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import TestPage from "./test/TestPage";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import TestHomePage from "./test/TestHomePage";
import TestAuthPage from "./test/TestAuthPage";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <>
    {/* <App /> */}
    <React.StrictMode>
      <BrowserRouter>
        <Routes>
          <Route path=":id" element={<TestPage />} />
          <Route path="/" element={<TestHomePage />} />
          <Route path="/login" element={<TestAuthPage />} />
        </Routes>
      </BrowserRouter>
    </React.StrictMode>
  </>
);

reportWebVitals();
