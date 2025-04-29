import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import roomService from '../services/room.service';

const HomePage = () => {
  const [roomId, setRoomId] = useState('');
  const [error, setError] = useState('');
  const currentUser = useSelector(state => state.auth.user);
  const navigate = useNavigate();

  const createRoom = async () => {
    try {
      const response = await roomService.createRoom(currentUser.token);
      navigate(`/room/${response.roomId}`);
    } catch (err) {
      setError('Failed to create room. Please try again.');
    }
  };

  const joinRoom = async () => {
    if (!roomId.trim()) {
      setError('Please enter a room ID');
      return;
    }

    try {
      await roomService.joinRoom(roomId.trim(), currentUser.token);
      navigate(`/room/${roomId.trim()}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to join room. Please check the ID and try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Video Conference</h1>
        <div className="space-y-4">
          <button
            onClick={createRoom}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Create New Room
          </button>
          <div className="flex items-center my-4">
            <div className="flex-1 border-t border-gray-300"></div>
            <span className="px-3 text-gray-500">or</span>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>
          <div>
            <label htmlFor="roomId" className="block text-sm font-medium text-gray-700 mb-1">
              Join Existing Room
            </label>
            <input
              type="text"
              id="roomId"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              placeholder="Enter room ID"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
            />
            {error && (
              <div className="mb-2 p-2 bg-red-100 text-red-700 rounded text-sm">
                {error}
              </div>
            )}
            <button
              onClick={joinRoom}
              className="w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              Join Room
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;