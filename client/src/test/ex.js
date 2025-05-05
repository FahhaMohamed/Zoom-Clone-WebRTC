import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import io from "socket.io-client";
import {
  FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash,
  FaDesktop, FaCopy, FaUserFriends, FaComments, FaSignOutAlt,
  FaExpand, FaCompress, FaTimes
} from "react-icons/fa";

export default function TestPage() {
  const { id } = useParams();
  const [roomID, userName] = id.split("&");

  // 1) Initialize ref to null so React can later attach the DOM node :contentReference[oaicite:3]{index=3}
  const localVideo = useRef(null);
  const localStream = useRef();
  const [remoteStreams, setRemoteStreams] = useState([]);
  const peers = useRef({});

  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);
  const [screenTrack, setScreenTrack] = useState(null);

  const socketRef = useRef();
  const [mySocketId, setMySocketId] = useState(null);      // store our own socket id :contentReference[oaicite:4]{index=4}
  const [showParticipants, setShowParticipants] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const chatContainerRef = useRef();
  const [notifications, setNotifications] = useState([]);

  // Track video/audio states per participant
  const [participantStates, setParticipantStates] = useState({});

  const addNotification = (message) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message }]);
    setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), 3000);
  };

  useEffect(() => {
    // Initialize socket :contentReference[oaicite:5]{index=5}
    socketRef.current = io("http://localhost:5000");
    socketRef.current.on("connect", () => setMySocketId(socketRef.current.id));  // capture our id :contentReference[oaicite:6]{index=6}

    const init = async () => {
      try {
        localStream.current = await navigator.mediaDevices.getUserMedia({
          video: true, audio: true
        });
        // only set srcObject if ref is attached :contentReference[oaicite:7]{index=7}
        if (localVideo.current) {
          localVideo.current.srcObject = localStream.current;
        }

        setParticipantStates(prev => ({
          ...prev,
          [socketRef.current.id]: { video: true, audio: true }
        }));

        socketRef.current.emit("joinRoom", {
          roomId: roomID, user: userName,
          videoEnabled: true, audioEnabled: true
        });
      } catch (err) {
        console.error("Error getting user media:", err);
      }
    };
    init();

    // Socket event handlers
    const handleAllUsers = (users) => {
        users.forEach(({ id: userID, name, videoEnabled, audioEnabled }) => {
          if (!peers.current[userID]) {
            const peer = createPeer(userID, name);
            peers.current[userID] = { peer, name };
            setParticipantStates(prev => ({
              ...prev,
              [userID]: { video: videoEnabled, audio: audioEnabled }
            }));
          }
        });
      };
  
      const handleReceiveOffer = ({ offer, caller, name, videoEnabled, audioEnabled }) => {
        if (!peers.current[caller]) {
          const peer = addPeer(offer, caller, name);
          peers.current[caller] = { peer, name };
          setParticipantStates(prev => ({
            ...prev,
            [caller]: { video: videoEnabled, audio: audioEnabled }
          }));
        }
      };
  
      const handleReceiveAnswer = ({ answer, from }) => {
        peers.current[from]?.peer.setRemoteDescription(
          new RTCSessionDescription(answer)
        );
      };
  
      const handleReceiveIce = ({ candidate, from }) => {
        peers.current[from]?.peer.addIceCandidate(
          new RTCIceCandidate(candidate)
        );
      };
  
      const handleUserLeft = (socketId) => {
        if (peers.current[socketId]) {
          peers.current[socketId].peer.close();
          delete peers.current[socketId];
          setRemoteStreams(prev => prev.filter(stream => stream.id !== socketId));
          if (fullScreenVideo === socketId) setFullScreenVideo(null);
          
          // Remove from states
          setParticipantStates(prev => {
            const newStates = { ...prev };
            delete newStates[socketId];
            return newStates;
          });
  
          // Add notification
          const leftUser = remoteStreams.find(s => s.id === socketId)?.name || "A user";
          addNotification(`${leftUser} has left the meeting`);
        }
      };
  
      const handleChatMessage = (formattedMsg) => {
        setMessages(prev => [...prev, formattedMsg]);
        scrollChatToBottom();
        
        // Show notification for admin messages
        if (formattedMsg.sender === "Admin") {
          addNotification(formattedMsg.text);
        }
      };
  
      const handleUserJoined = ({ user }) => {
        addNotification(`${user} has joined the meeting`);
      };
  
      const handleStateChange = ({ userId, videoEnabled, audioEnabled }) => {
        setParticipantStates(prev => ({
          ...prev,
          [userId]: { video: videoEnabled, audio: audioEnabled }
        }));
      };
  
      // Add event listeners
      socketRef.current.on("all-users", handleAllUsers);
      socketRef.current.on("receive-offer", handleReceiveOffer);
      socketRef.current.on("receive-answer", handleReceiveAnswer);
      socketRef.current.on("receive-ice", handleReceiveIce);
      socketRef.current.on("user-left", handleUserLeft);
      socketRef.current.on("message", handleChatMessage);
      socketRef.current.on("user-joined", handleUserJoined);
      socketRef.current.on("state-changed", handleStateChange);

    return () => {
        // Remove all listeners
      socketRef.current.off("all-users", handleAllUsers);
      socketRef.current.off("receive-offer", handleReceiveOffer);
      socketRef.current.off("receive-answer", handleReceiveAnswer);
      socketRef.current.off("receive-ice", handleReceiveIce);
      socketRef.current.off("user-left", handleUserLeft);
      socketRef.current.off("message", handleChatMessage);
      socketRef.current.off("user-joined", handleUserJoined);
      socketRef.current.off("state-changed", handleStateChange);
      // cleanup
      socketRef.current.disconnect();
      if (localStream.current) localStream.current.getTracks().forEach(t => t.stop());
      Object.values(peers.current).forEach(({ peer }) => peer.close());
      peers.current = {};
    };
  }, [roomID, userName]);

  // … your offer/answer/ICE handlers, sendMessage, createPeer, addPeer, toggleAudio/Video/ScreenShare, etc. …
  const scrollChatToBottom = () => {
    setTimeout(() => {
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      }
    }, 100);
  };

  const sendMessage = () => {
    if (messageInput.trim()) {
      socketRef.current.emit("chatMessage", messageInput);
      setMessageInput("");
    }
  };

  const createPeer = (targetID, name) => {
    const peer = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" }
      ]
    });

    // Add local stream tracks
    localStream.current.getTracks().forEach(track => {
      peer.addTrack(track, localStream.current);
    });

    peer.onicecandidate = (e) => {
      if (e.candidate) {
        socketRef.current.emit("send-ice", {
          target: targetID,
          candidate: e.candidate,
        });
      }
    };

    peer.ontrack = (e) => {
      const remoteStream = e.streams[0];
      setRemoteStreams(prev => {
        const exists = prev.some(stream => stream.id === targetID);
        if (!exists) {
          return [...prev, { stream: remoteStream, name, id: targetID }];
        }
        return prev;
      });
    };

    peer.createOffer()
      .then(offer => peer.setLocalDescription(offer))
      .then(() => {
        socketRef.current.emit("send-offer", {
          target: targetID,
          offer: peer.localDescription,
          caller: socketRef.current.id,
          name: userName,
          videoEnabled,
          audioEnabled
        });
      })
      .catch(err => console.error("Error creating offer:", err));

    return peer;
  };

  const addPeer = (offer, callerID, name) => {
    const peer = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" }
      ]
    });

    // Add local stream tracks
    localStream.current.getTracks().forEach(track => {
      peer.addTrack(track, localStream.current);
    });

    peer.onicecandidate = (e) => {
      if (e.candidate) {
        socketRef.current.emit("send-ice", {
          target: callerID,
          candidate: e.candidate,
        });
      }
    };

    peer.ontrack = (e) => {
      const remoteStream = e.streams[0];
      setRemoteStreams(prev => {
        const exists = prev.some(stream => stream.id === callerID);
        if (!exists) {
          return [...prev, { stream: remoteStream, name, id: callerID }];
        }
        return prev;
      });
    };

    peer.setRemoteDescription(new RTCSessionDescription(offer))
      .then(() => peer.createAnswer())
      .then(answer => peer.setLocalDescription(answer))
      .then(() => {
        socketRef.current.emit("send-answer", {
          target: callerID,
          answer: peer.localDescription,
        });
      })
      .catch(err => console.error("Error handling offer:", err));

    return peer;
  };

  const toggleAudio = () => {
    if (localStream.current) {
      const newState = !audioEnabled;
      localStream.current.getAudioTracks().forEach(track => {
        track.enabled = newState;
      });
      setAudioEnabled(newState);
      
      // Update state and notify others
      socketRef.current.emit("state-change", { 
        roomId: roomID,
        videoEnabled,
        audioEnabled: newState
      });
    }
  };

  const toggleVideo = () => {
    if (localStream.current) {
      const newState = !videoEnabled;
      localStream.current.getVideoTracks().forEach(track => {
        track.enabled = newState;
      });
      setVideoEnabled(newState);
      
      // Update state and notify others
      socketRef.current.emit("state-change", { 
        roomId: roomID,
        videoEnabled: newState,
        audioEnabled
      });
    }
  };

  const toggleScreenShare = async () => {
    if (!screenSharing) {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
        });
        const screenTrackLocal = screenStream.getVideoTracks()[0];

        Object.values(peers.current).forEach(({ peer }) => {
          const sender = peer.getSenders().find(s => s.track.kind === "video");
          if (sender) sender.replaceTrack(screenTrackLocal);
        });

        screenTrackLocal.onended = () => {
          stopScreenShare();
        };

        setScreenTrack(screenTrackLocal);
        setScreenSharing(true);
      } catch (err) {
        console.error("Error sharing screen:", err);
      }
    } else {
      stopScreenShare();
    }
  };

  const stopScreenShare = () => {
    if (screenTrack) {
      screenTrack.stop();
      const videoTrack = localStream.current.getVideoTracks()[0];
      
      Object.values(peers.current).forEach(({ peer }) => {
        const sender = peer.getSenders().find(s => s.track.kind === "video");
        if (sender && videoTrack) sender.replaceTrack(videoTrack);
      });

      setScreenSharing(false);
      setScreenTrack(null);
    }
  };

  const copyRoomID = () => {
    navigator.clipboard.writeText(roomID);
    addNotification("Room ID copied to clipboard");
  };

 

  // Render video element with proper ref handling
  const renderVideo = (stream, id, name, isLocal = false) => {
    return (
      <video
        key={id}
        autoPlay
        playsInline
        muted={isLocal}
        ref={(video) => {
          if (video && video.srcObject !== stream) {
            video.srcObject = stream;
          }
        }}
        className="w-full h-full object-cover"
        onLoadedMetadata={() => {
          // Force play to prevent black screen
          const video = document.querySelector(`video[key="${id}"]`);
          if (video) video.play().catch(e => console.log("Auto-play prevented"));
        }}
      />
    );
  };

  const toggleFullScreen = (id) => setFullScreenVideo(fullScreenVideo === id ? null : id);

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      {/* … notifications & header … */}
      {/* Notifications */}
            <div className="fixed top-4 right-4 z-50 space-y-2">
              {notifications.map(({ id, message }) => (
                <div key={id} className="bg-gray-800 bg-opacity-90 text-white px-4 py-2 rounded shadow-lg flex items-center">
                  <span>{message}</span>
                  <button 
                    onClick={() => setNotifications(prev => prev.filter(n => n.id !== id))}
                    className="ml-2"
                  >
                    <FaTimes size={12} />
                  </button>
                </div>
              ))}
            </div>
      
            {/* Main header */}
            <header className="bg-gray-800 py-2 px-4 flex justify-between items-center border-b border-gray-700">
              <div className="flex items-center space-x-4">
                <h1 className="text-xl font-semibold">Video Conference</h1>
                <span className="text-sm bg-gray-700 px-2 py-1 rounded">{roomID}</span>
              </div>
              <div className="flex items-center space-x-4">
                <button 
                  onClick={() => setShowParticipants(!showParticipants)}
                  className={`p-2 rounded-full ${showParticipants ? 'bg-blue-600' : 'hover:bg-gray-700'}`}
                >
                  <FaUserFriends />
                </button>
                <button 
                  onClick={() => setShowChat(!showChat)}
                  className={`p-2 rounded-full ${showChat ? 'bg-blue-600' : 'hover:bg-gray-700'}`}
                >
                  <FaComments />
                </button>
                <button 
                  onClick={() => window.location.href = "/"}
                  className="p-2 rounded-full bg-red-600 hover:bg-red-700"
                >
                  <FaSignOutAlt />
                </button>
              </div>
            </header>

      <div className="flex flex-1 overflow-hidden">
        {showParticipants && (
          <div className="w-64 bg-gray-800 border-r border-gray-700">
            <div className="p-4 border-b border-gray-700">
              <h2 className="font-semibold">
                Participants ({remoteStreams.length + 1})
              </h2>
            </div>
            <div className="p-2 overflow-y-auto">
              {/* Local “You” entry */}
              <div className={`flex items-center p-2 rounded mb-2 ${
                mySocketId === socketRef.current.id ? "bg-blue-600" : "bg-gray-700"
              }`}>
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-2">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <span>{userName} (You)</span>
                <div className="ml-auto flex space-x-1">
                  {!audioEnabled && <FaMicrophoneSlash className="text-red-500" />}
                  {!videoEnabled && <FaVideoSlash className="text-red-500" />}
                </div>
              </div>

              {/* Remote participants */}
              {remoteStreams.map(({ name, id }) => (
                <div
                  key={id}
                  className={`flex items-center p-2 rounded mb-1 ${
                    id === mySocketId ? "bg-blue-600" : "hover:bg-gray-700"
                  }`}                                   {/* highlight current user :contentReference[oaicite:8]{index=8} */}
                >
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-2">
                    {name.charAt(0).toUpperCase()}
                  </div>
                  <span>{name}</span>
                  <div className="ml-auto flex space-x-1">
                    {participantStates[id]?.audio === false && (
                      <FaMicrophoneSlash className="text-red-500" />
                    )}
                    {participantStates[id]?.video === false && (
                      <FaVideoSlash className="text-red-500" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Video grid */}
        <div className={`flex-1 flex flex-col ${showChat ? 'w-2/3' : 'w-full'}`}>
          <div className="flex-1 p-4 overflow-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {/* Local video with attached ref :contentReference[oaicite:9]{index=9} */}
              <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
                <video
                  ref={localVideo}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                  onLoadedMetadata={() =>
                    localVideo.current?.play().catch(() => {})
                  }
                />
                <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 px-2 py-1 rounded text-sm">
                  {userName} (You)
                </div>
                <button
                  onClick={() => toggleFullScreen('local')}
                  className="absolute top-2 right-2 bg-black bg-opacity-50 p-1 rounded-full hover:bg-opacity-70"
                >
                  <FaExpand size={14} />
                </button>
                {!videoEnabled && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <FaVideoSlash size={24} />
                  </div>
                )}
              </div>

              {/* Remote streams… */}
              {remoteStreams.map(({ stream, name, id }) => (
                <div key={id} className="relative bg-black rounded-lg overflow-hidden aspect-video">
                  {/* same renderVideo logic */}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Chat sidebar… */}
      </div>

      {/* Controls footer… */}
    </div>
  );
}
