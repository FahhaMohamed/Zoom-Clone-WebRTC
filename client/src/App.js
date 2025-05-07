import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RoomPage from "./pages/RoomPage";
import AuthChecker from "./services/AuthChecker";
import LoadingIndicator from "./components/loadingIndicator";
import SplashScreen from "./components/SplashScreen";

const App = () => {
  const [loading, setLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const splashTimer = setTimeout(() => {
      setShowSplash(false);
    }, 2500);

    return () => clearTimeout(splashTimer);
  }, []);

  const handleAuthCheckComplete = (isLoading) => {
    setLoading(isLoading);
    setAuthChecked(true);
  };

  return (
    <Router>
      <AuthChecker setLoading={handleAuthCheckComplete} />
      
      {showSplash ? (
        <SplashScreen />
      ) : !authChecked || loading ? (
        <LoadingIndicator />
      ) : (
        <Routes>
          <Route path="*" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/room/:id" element={<RoomPage />} />
        </Routes>
      )}
    </Router>
  );
};

export default App;