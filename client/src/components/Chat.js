import React, { useState } from "react";
import {  useSelector } from "react-redux";
import { FiSend } from "react-icons/fi";
import { useWebRTC } from "../context/WebRTCContext";

const Chat = () => {
  const [message, setMessage] = useState("");
  const messages = useSelector((state) => state.room.messages);
  const { sendMessage } = useWebRTC();
  const currentUser = useSelector((state) => state.auth.user);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      sendMessage(message);
      setMessage("");
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-100 rounded-lg overflow-hidden">
      <div className="p-4 border-b border-gray-200 bg-white">
        <h3 className="font-semibold text-lg">Chat</h3>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${
              msg.sender === currentUser?.name ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-xs md:max-w-md rounded-lg px-4 py-2 ${
                msg.sender === currentUser?.name
                  ? "bg-blue-500 text-white"
                  : "bg-white text-gray-800"
              }`}
            >
              {msg.sender !== currentUser?.name && (
                <div className="font-semibold text-sm">{msg.sender}</div>
              )}
              <div>{msg.text}</div>
            </div>
          </div>
        ))}
      </div>
      <form
        onSubmit={handleSubmit}
        className="p-4 border-t border-gray-200 bg-white"
      >
        <div className="flex items-center">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 border border-gray-300 rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded-r-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <FiSend />
          </button>
        </div>
      </form>
    </div>
  );
};

export default Chat;
