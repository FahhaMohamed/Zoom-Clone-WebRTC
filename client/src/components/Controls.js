import React from "react";
import {
  FiMic,
  FiMicOff,
  FiVideo,
  FiVideoOff,
  FiMonitor,
  FiPhone,
  FiMessageSquare,
} from "react-icons/fi";
import { useWebRTC } from "../context/WebRTCContext";

const Controls = ({ showChat, setShowChat }) => {
  const {
    toggleAudio,
    toggleVideo,
    shareScreen,
    leaveCall,
    stream,
    isScreenSharing,
  } = useWebRTC();

  const isAudioOn = stream?.getAudioTracks()[0]?.enabled;
  const isVideoOn = stream?.getVideoTracks()[0]?.enabled;

  return (
    <div className="flex items-center justify-center space-x-4 p-4 bg-white rounded-lg shadow-md">
      <button
        onClick={toggleAudio}
        className={`p-3 rounded-full ${
          isAudioOn
            ? "bg-gray-200 hover:bg-gray-300"
            : "bg-red-500 text-white hover:bg-red-600"
        }`}
        aria-label={isAudioOn ? "Mute microphone" : "Unmute microphone"}
      >
        {isAudioOn ? <FiMic size={20} /> : <FiMicOff size={20} />}
      </button>

      <button
        onClick={toggleVideo}
        className={`p-3 rounded-full ${
          isVideoOn
            ? "bg-gray-200 hover:bg-gray-300"
            : "bg-red-500 text-white hover:bg-red-600"
        }`}
        aria-label={isVideoOn ? "Turn off camera" : "Turn on camera"}
      >
        {isVideoOn ? <FiVideo size={20} /> : <FiVideoOff size={20} />}
      </button>

      <button
        onClick={shareScreen}
        className={`p-3 rounded-full ${
          isScreenSharing
            ? "bg-blue-500 text-white hover:bg-blue-600"
            : "bg-gray-200 hover:bg-gray-300"
        }`}
        aria-label={isScreenSharing ? "Stop screen sharing" : "Share screen"}
      >
        <FiMonitor size={20} />
      </button>

      <button
        onClick={() => setShowChat(!showChat)}
        className={`p-3 rounded-full ${
          showChat
            ? "bg-blue-500 text-white hover:bg-blue-600"
            : "bg-gray-200 hover:bg-gray-300"
        }`}
        aria-label={showChat ? "Hide chat" : "Show chat"}
      >
        <FiMessageSquare size={20} />
      </button>

      <button
        onClick={leaveCall}
        className="p-3 rounded-full bg-red-500 text-white hover:bg-red-600"
        aria-label="Leave call"
      >
        <FiPhone size={20} />
      </button>
    </div>
  );
};

export default Controls;
