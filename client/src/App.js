import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./store/store";
import { WebRTCProvider } from "./context/WebRTCContext";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RoomPage from "./pages/RoomPage";
import PrivateRoute from "./components/PrivateRoute";
import AuthInitializer from "./components/AuthInitializer";

const App = () => {
  return (
    <Provider store={store}>
      <AuthInitializer>
        <WebRTCProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route
                path="/"
                element={
                  <PrivateRoute>
                    <HomePage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/room/:roomId"
                element={
                  <PrivateRoute>
                    <RoomPage />
                  </PrivateRoute>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </WebRTCProvider>
      </AuthInitializer>
    </Provider>
  );
};

export default App;
