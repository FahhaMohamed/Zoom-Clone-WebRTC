import React, { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import TestPage from "./test/TestPage";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import TestHomePage from "./test/TestHomePage";
import TestAuthPage from "./test/TestAuthPage";
import { Provider } from "react-redux";
import { store } from "./store/store";
import { Toaster } from "react-hot-toast";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <Provider store={store}>
    <Toaster position="top-center" reverseOrder={false} />
    <App />
  </Provider>
);

reportWebVitals();
