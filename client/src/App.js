import React, { useState } from "react";
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

const App = () => {
  const [loading, setLoading] = useState(true);
  return (
    <Router>
      <AuthChecker setLoading={setLoading} />
      {loading ? (
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
