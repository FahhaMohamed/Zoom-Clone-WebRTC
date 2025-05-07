import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../services/auth.service";
import { createRoom, joinRoom } from "../services/room.service";
import SocialLinks from "../components/socialLinks";

function HomePage() {
  const [activeTab, setActiveTab] = useState("home");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState("");
  const [maxParticipants, setMaxParticipants] = useState(10);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { room } = useSelector((state) => state.room);
  const [profile] = useState({
    name: "Alex Johnson",
    email: "alex.johnson@example.com",
    avatar:
      "https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg?semt=ais_hybrid&w=740",
  });

  const handleCreateRoom = (e) => {
    e.preventDefault();
    dispatch(createRoom(roomId, maxParticipants, navigate));
  };

  const handleJoinRoom = (e) => {
    e.preventDefault();

    dispatch(joinRoom(roomId, navigate));
  };

  const handleLogout = () => {
    dispatch(logout);
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
    console.log(user);
  }, [isAuthenticated, navigate, room, user]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-gray-100">
      {/* Header */}
      <header className="bg-gray-800 p-3 flex justify-between items-center border-b border-gray-700">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v8a2 2 0 01-2 2h-2a2 2 0 01-2-2V6z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold">VideoConnect</h1>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setActiveTab("profile")}
            className="flex items-center space-x-2 hover:bg-gray-700 p-2 rounded-lg transition-colors"
          >
            <img
              src={profile.avatar}
              alt="Profile"
              className="w-8 h-8 rounded-full object-cover border border-gray-600"
            />
          </button>
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
            title="Logout"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 flex justify-center items-center">
        {activeTab === "home" && (
          <div className="w-full max-w-md space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-2">
                Welcome, {localStorage.getItem("user")}!
              </h2>
              <p className="text-gray-400">Start or join a video meeting</p>
            </div>

            <div className="bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-700">
              <div className="space-y-6">
                <button
                  onClick={() => setActiveTab("create")}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-lg font-medium flex items-center justify-center space-x-2 transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  <span>New Meeting</span>
                </button>

                <div className="flex items-center space-x-4">
                  <div className="flex-1 border-t border-gray-600"></div>
                  <span className="text-gray-400 text-sm">OR</span>
                  <div className="flex-1 border-t border-gray-600"></div>
                </div>

                <form onSubmit={handleJoinRoom}>
                  <div className="space-y-4">
                    <input
                      type="text"
                      value={roomId}
                      required={true}
                      onChange={(e) => setRoomId(e.target.value)}
                      placeholder="Enter meeting ID"
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      // onClick={() => handleJoinRoom({preventDefault: () => {}})}
                      className={`w-full ${
                        roomId
                          ? "bg-green-600 hover:bg-green-700"
                          : "bg-gray-700 hover:bg-gray-600"
                      } text-white px-6 py-3 rounded-lg font-medium transition-colors`}
                    >
                      {roomId ? "Join Now" : "Join Meeting"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {activeTab === "create" && (
          <div className="bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-700 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">New Meeting</h2>
              <button
                onClick={() => setActiveTab("home")}
                className="text-gray-400 hover:text-white"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <form onSubmit={handleCreateRoom} className="space-y-6">
              <div>
                <label className="block text-gray-300 mb-2">
                  Meeting ID (optional)
                </label>
                <input
                  type="text"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  placeholder="Custom meeting ID"
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-gray-400 text-sm mt-1">
                  Leave blank for auto-generated ID
                </p>
              </div>

              <div>
                <label className="block text-gray-300 mb-2">
                  Max Participants
                </label>
                <select
                  value={maxParticipants}
                  onChange={(e) => setMaxParticipants(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {[2, 5, 10, 20, 50, 100].map((num) => (
                    <option key={num} value={num} className="bg-gray-800">
                      {num} participants
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Start Meeting
              </button>
            </form>
          </div>
        )}

        {activeTab === "join" && (
          <div className="bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-700 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Join Meeting</h2>
              <button
                onClick={() => setActiveTab("home")}
                className="text-gray-400 hover:text-white"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}

        {activeTab === "profile" && (
          <div className="bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-700 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Profile</h2>
              <button
                onClick={() => setActiveTab("home")}
                className="text-gray-400 hover:text-white"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="flex flex-col items-center space-y-6">
              <img
                src={profile.avatar}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover border-4 border-blue-500/20"
              />

              <div className="w-full space-y-4">
                <div className="bg-gray-700 p-4 rounded-lg">
                  <label className="block text-gray-400 text-sm mb-1">
                    Name
                  </label>
                  <p className="text-lg font-medium">
                    {localStorage.getItem("user")}
                  </p>
                </div>

                <div className="bg-gray-700 p-4 rounded-lg">
                  <label className="block text-gray-400 text-sm mb-1">
                    Email
                  </label>
                  <p className="text-lg font-medium">
                    {localStorage.getItem("email")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-6 bg-gray-800 border-t border-gray-700">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-center md:text-left mb-4 md:mb-0">
              <p className="text-gray-400 text-sm">
                © {new Date().getFullYear()} All Rights Reserved
              </p>
            </div>
            <div className="flex flex-col items-center">
              <p className="text-gray-300 font-medium text-sm mb-1">
                Developed by
              </p>
              <p className="text-blue-400 font-bold">MOHAMED FAHHAM</p>
            </div>
            <SocialLinks/>
          </div>
        </div>
      </footer>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-gray-800 rounded-xl shadow-2xl border border-gray-700 p-6 max-w-sm w-full">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-xl font-bold">Confirm Logout</h3>
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="text-gray-400 hover:text-white"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <p className="text-gray-300 mb-6">
              Are you sure you want to logout from your account?
            </p>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="px-4 py-2 border border-gray-600 text-gray-300 hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HomePage;
