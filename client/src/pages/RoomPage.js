import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { leaveRoom } from '../slices/roomSlice';
import { useWebRTC } from '../context/WebRTCContext';
import VideoPlayer from '../components/VideoPlayer';
import Controls from '../components/Controls';
import Chat from '../components/Chat';
import roomService from '../services/room.service';

const RoomPage = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const currentUser = useSelector(state => state.auth.user);
//   const participants = useSelector(state => state.room.participants);
  const {
    peers,
    stream,
    // userVideo,
    startMedia,
    leaveCall
  } = useWebRTC();
  const [showChat, setShowChat] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    const initRoom = async () => {
      try {
        await roomService.joinRoom(roomId, currentUser.token);
        await startMedia();
        setLoading(false);
      } catch (err) {
        console.error('Error joining room:', err);
        navigate('/');
      }
    };

    initRoom();

    return () => {
      leaveCall();
      dispatch(leaveRoom());
    };
  }, [roomId, currentUser, navigate, dispatch, startMedia, leaveCall]);

  const handleLeaveRoom = () => {
    leaveCall();
    dispatch(leaveRoom());
    navigate('/');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-700">Joining room...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm py-4 px-6">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-semibold">Room: {roomId}</h1>
          <button
            onClick={handleLeaveRoom}
            className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            Leave Room
          </button>
        </div>
      </header>

      <main className="flex-1 p-4">
        <div className="flex flex-col lg:flex-row h-full gap-4">
          <div className={`${showChat ? 'lg:w-2/3' : 'w-full'} flex flex-col gap-4`}>
            <div className="bg-white rounded-lg shadow-md p-4 flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 h-full">
                {/* Local video */}
                {stream && (
                  <div className="relative" style={{ minHeight: '200px' }}>
                    <VideoPlayer stream={stream} isMuted={true} isLocal={true} />
                  </div>
                )}

                {/* Remote videos */}
                {Object.entries(peers).map(([id, peer]) => (
                  <div key={id} className="relative" style={{ minHeight: '200px' }}>
                    <VideoPlayer stream={peer.stream} isMuted={false} isLocal={false} />
                  </div>
                ))}
              </div>
            </div>

            <Controls showChat={showChat} setShowChat={setShowChat} />
          </div>

          {showChat && (
            <div className="lg:w-1/3 h-full">
              <Chat />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default RoomPage;