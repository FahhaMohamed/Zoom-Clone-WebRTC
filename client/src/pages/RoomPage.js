import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import io from "socket.io-client";
import {
  FaMicrophoneSlash,
  FaVideo,
  FaVideoSlash,
  FaDesktop,
  FaCopy,
  FaUserFriends,
  FaComments,
  FaSignOutAlt,
  FaExpand,
  FaCompress,
  FaTimes,
} from "react-icons/fa";
import "../styles/RoomPage.module.css";
import popup from "../components/popup";

export default function RoomPage() {
  const navigate = useNavigate();
  const videoRefs = useRef({});
  const { id } = useParams();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [roomID, userName] = id.split("&");
  const localVideoRef = useRef(null);
  const localStream = useRef(null);
  const [remoteStreams, setRemoteStreams] = useState([]);
  const peers = useRef({});
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);
  const [screenTrack, setScreenTrack] = useState(null);
  const socketRef = useRef(null);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [fullScreenVideo, setFullScreenVideo] = useState("local");
  const chatContainerRef = useRef(null);
  const [notifications, setNotifications] = useState([]);
  const [participantStates, setParticipantStates] = useState({});
  const [videoDimensions, setVideoDimensions] = useState({});

  const addNotification = (message) => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { id, message }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 3000);
  };

  const handleLeftRoom = (e) => {
    e.preventDefault();
    navigate("/home", { replace: true });
  };

  useEffect(() => {
    socketRef.current = io("http://localhost:5000");

    const init = async () => {
      try {
        const cameraPermission = await navigator.permissions.query({
          name: "camera",
        });
        const microphonePermission = await navigator.permissions.query({
          name: "microphone",
        });

        if (
          cameraPermission.state === "denied" ||
          microphonePermission.state === "denied"
        ) {
          addNotification(
            "Please enable camera and microphone permissions in your browser settings"
          );
          return;
        }

        localStream.current = await navigator.mediaDevices
          .getUserMedia({
            video: true,
            audio: true,
          })
          .catch((err) => {
            addNotification(
              "Please allow camera and microphone access to join the call"
            );
            throw err;
          });

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = localStream.current;
        }

        setParticipantStates((prev) => ({
          ...prev,
          [socketRef.current.id]: { video: true, audio: true },
        }));

        socketRef.current.emit("joinRoom", {
          roomId: roomID,
          user: userName,
          videoEnabled: true,
          audioEnabled: true,
        });
      } catch (err) {
        console.error("Error initializing media:", err);
        return;
      }
    };

    init();

    const handleAllUsers = (users) => {
      users.forEach(({ id: userID, name, videoEnabled, audioEnabled }) => {
        if (!peers.current[userID]) {
          const peer = createPeer(userID, name);
          peers.current[userID] = { peer, name };
          setParticipantStates((prev) => ({
            ...prev,
            [userID]: { video: videoEnabled, audio: audioEnabled },
          }));
        }
      });
    };

    const handleReceiveOffer = ({
      offer,
      caller,
      name,
      videoEnabled,
      audioEnabled,
    }) => {
      if (!peers.current[caller]) {
        const peer = addPeer(offer, caller, name);
        peers.current[caller] = { peer, name };
        setParticipantStates((prev) => ({
          ...prev,
          [caller]: { video: videoEnabled, audio: audioEnabled },
        }));
      }
    };

    const handleReceiveAnswer = ({ answer, from }) => {
      peers.current[from]?.peer.setRemoteDescription(
        new RTCSessionDescription(answer)
      );
    };

    const handleReceiveIce = ({ candidate, from }) => {
      peers.current[from]?.peer.addIceCandidate(new RTCIceCandidate(candidate));
    };

    const handleUserLeft = (socketId) => {
      if (peers.current[socketId]) {
        peers.current[socketId].peer.close();
        delete peers.current[socketId];
        setRemoteStreams((prev) =>
          prev.filter((stream) => stream.id !== socketId)
        );
        if (fullScreenVideo === socketId) setFullScreenVideo(null);

        setParticipantStates((prev) => {
          const newStates = { ...prev };
          delete newStates[socketId];
          return newStates;
        });

        setVideoDimensions((prev) => {
          const newDims = { ...prev };
          delete newDims[socketId];
          return newDims;
        });
      }
    };

    const handleChatMessage = (formattedMsg) => {
      setMessages((prev) => [...prev, formattedMsg]);
      scrollChatToBottom();

      if (formattedMsg.sender === "Admin") {
        addNotification(formattedMsg.text);
      }
    };

    const handleUserJoined = ({ user }) => {};

    const handleStateChange = ({ userId, videoEnabled, audioEnabled }) => {
      setParticipantStates((prev) => ({
        ...prev,
        [userId]: { video: videoEnabled, audio: audioEnabled },
      }));
    };

    socketRef.current.on("all-users", handleAllUsers);
    socketRef.current.on("receive-offer", handleReceiveOffer);
    socketRef.current.on("receive-answer", handleReceiveAnswer);
    socketRef.current.on("receive-ice", handleReceiveIce);
    socketRef.current.on("user-left", handleUserLeft);
    socketRef.current.on("message", handleChatMessage);
    socketRef.current.on("user-joined", handleUserJoined);
    socketRef.current.on("state-changed", handleStateChange);

    return () => {
      socketRef.current.off("all-users", handleAllUsers);
      socketRef.current.off("receive-offer", handleReceiveOffer);
      socketRef.current.off("receive-answer", handleReceiveAnswer);
      socketRef.current.off("receive-ice", handleReceiveIce);
      socketRef.current.off("user-left", handleUserLeft);
      socketRef.current.off("message", handleChatMessage);
      socketRef.current.off("user-joined", handleUserJoined);
      socketRef.current.off("state-changed", handleStateChange);

      if (localStream.current) {
        localStream.current.getTracks().forEach((track) => track.stop());
      }

      Object.values(peers.current).forEach(({ peer }) => {
        peer.close();
      });
      peers.current = {};

      socketRef.current.disconnect();
    };
  }, [roomID, userName]);

  const scrollChatToBottom = () => {
    setTimeout(() => {
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop =
          chatContainerRef.current.scrollHeight;
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
        { urls: "stun:stun1.l.google.com:19302" },
      ],
    });

    localStream.current.getTracks().forEach((track) => {
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
      setRemoteStreams((prev) => {
        const exists = prev.some((stream) => stream.id === targetID);
        if (!exists) {
          return [...prev, { stream: remoteStream, name, id: targetID }];
        }
        return prev;
      });
    };

    peer
      .createOffer()
      .then((offer) => peer.setLocalDescription(offer))
      .then(() => {
        socketRef.current.emit("send-offer", {
          target: targetID,
          offer: peer.localDescription,
          caller: socketRef.current.id,
          name: userName,
          videoEnabled,
          audioEnabled,
        });
      })
      .catch((err) => console.error("Error creating offer:", err));

    return peer;
  };

  const addPeer = (offer, callerID, name) => {
    const peer = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
      ],
    });

    localStream.current.getTracks().forEach((track) => {
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
      setRemoteStreams((prev) => {
        const exists = prev.some((stream) => stream.id === callerID);
        if (!exists) {
          return [...prev, { stream: remoteStream, name, id: callerID }];
        }
        return prev;
      });
    };

    peer
      .setRemoteDescription(new RTCSessionDescription(offer))
      .then(() => peer.createAnswer())
      .then((answer) => peer.setLocalDescription(answer))
      .then(() => {
        socketRef.current.emit("send-answer", {
          target: callerID,
          answer: peer.localDescription,
        });
      })
      .catch((err) => console.error("Error handling offer:", err));

    return peer;
  };

  const toggleVideo = () => {
    if (localStream.current) {
      const newState = !videoEnabled;
      localStream.current.getVideoTracks().forEach((track) => {
        track.enabled = newState;
      });
      setVideoEnabled(newState);

      socketRef.current.emit("state-change", {
        roomId: roomID,
        videoEnabled: newState,
        audioEnabled,
      });

      Object.values(peers.current).forEach(({ peer }) => {
        const senders = peer.getSenders();
        const videoSender = senders.find((s) => s.track?.kind === "video");
        if (videoSender && videoSender.track) {
          videoSender.track.enabled = newState;
        }
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
          const sender = peer
            .getSenders()
            .find((s) => s.track.kind === "video");
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
        const sender = peer.getSenders().find((s) => s.track.kind === "video");
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

  const toggleFullScreen = (id) => {
    setFullScreenVideo(fullScreenVideo === id ? null : id);
  };

  const handleVideoLoadedMetadata = (id, e) => {
    const video = e.target;
    videoRefs.current[id] = video;

    const { videoWidth, videoHeight } = video;
    setVideoDimensions((prev) => ({
      ...prev,
      [id]: { width: videoWidth, height: videoHeight },
    }));
  };

  const renderVideo = (stream, id, name, isLocal = false) => {
    const showVideo = isLocal
      ? videoEnabled
      : participantStates[id]?.video !== false;

    return (
      <div className="video-container w-full h-full relative">
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
          onLoadedMetadata={(e) => handleVideoLoadedMetadata(id, e)}
          className={`video-element w-full h-full object-cover rounded-t-xl rounded-b-xl ${
            !showVideo ? "hidden" : ""
          }`}
          style={{
            aspectRatio: videoDimensions[id]
              ? `${videoDimensions[id].width}/${videoDimensions[id].height}`
              : "16/9",
          }}
        />

        <span className="absolute bottom-2 left-2 bg-black bg-opacity-50 px-2 py-1 rounded text-sm">
          {name}
          {name === userName ? " (You)" : ""}
        </span>
        {!showVideo && (
          <div className="video-off-overlay absolute inset-0 flex items-center justify-center bg-black bg-opacity-70">
            <div className="text-center">
              <div className="avatar-placeholder flex-center w-16 h-16 rounded-full bg-gray-600 flex items-center justify-center text-2xl font-bold">
                {name.charAt(0).toUpperCase()}
              </div>
              <p className="text-sm mt-2">
                {isLocal ? "Your camera is off" : `${name}'s camera is off`}
              </p>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      {/* Notifications */}
      <div className="fixed inset-0 flex items-end justify-center pointer-events-none z-50 mb-20">
        <div className="space-y-2">
          {notifications.map(({ id, message }) => (
            <div
              key={id}
              className="bg-gray-800 bg-opacity-90 text-white px-6 py-4 rounded-lg shadow-xl flex items-center max-w-md mx-auto"
            >
              <span className="text-lg font-medium">{message}</span>
              <button
                onClick={() =>
                  setNotifications((prev) => prev.filter((n) => n.id !== id))
                }
                className="ml-4 p-1 hover:bg-gray-700 rounded-full pointer-events-auto"
              >
                <FaTimes size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Main header */}
      <header className="bg-gray-800 py-2 px-4 flex justify-between items-center border-b border-gray-700">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 p-4">
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
          <span className="text-sm bg-gray-700 px-2 py-1 rounded">
            <strong>Room ID</strong> {roomID}
          </span>
          <FaCopy
            size={20}
            onClick={copyRoomID}
            style={{ cursor: "pointer" }}
          />
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowParticipants(!showParticipants)}
            className={`p-2 rounded-full ${
              showParticipants ? "bg-blue-600" : "hover:bg-gray-700"
            }`}
          >
            <FaUserFriends />
          </button>
          <button
            onClick={() => setShowChat(!showChat)}
            className={`p-2 rounded-full ${
              showChat ? "bg-blue-600" : "hover:bg-gray-700"
            }`}
          >
            <FaComments />
          </button>
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="p-2 rounded-full bg-red-600 hover:bg-red-700"
          >
            <FaSignOutAlt />
          </button>
        </div>
      </header>

      {/* Main content area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Participants sidebar */}
        {showParticipants && (
          <div className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
            <div className="p-4 border-b border-gray-700">
              <h2 className="font-semibold">
                Participants ({remoteStreams.length + 1})
              </h2>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              <div className="flex items-center p-2 bg-blue-800 rounded mb-2">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-2">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <span>{userName} (You)</span>
                <div className="ml-auto flex space-x-1">
                  {!audioEnabled && (
                    <FaMicrophoneSlash className="text-red-500" />
                  )}
                  {!videoEnabled && <FaVideoSlash className="text-red-500" />}
                </div>
              </div>
              {remoteStreams.map(({ name, id }) => (
                <div
                  key={id}
                  className="flex items-center p-2 hover:bg-gray-700 rounded mb-1"
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

        {/* Video area */}
        <div
          className={`flex-1 flex flex-col ${showChat ? "w-2/3" : "w-full"}`}
        >
          {/* Full screen view */}
          {fullScreenVideo && (
            <div className="flex-1 flex bg-gray-900">
              {/* Main video area - takes 80% width */}
              <div className="w-4/5 h-full flex items-center justify-center p-2 relative">
                {fullScreenVideo === "local" ? (
                  <div
                    className="relative h-full"
                    style={{
                      aspectRatio: videoDimensions["local"]
                        ? `${videoDimensions["local"].width}/${videoDimensions["local"].height}`
                        : "16/9",
                      maxWidth: "100%",
                      maxHeight: "100%",
                    }}
                  >
                    {renderVideo(localStream.current, "local", userName, true)}
                    <button
                      onClick={() => toggleFullScreen("local")}
                      className="absolute top-4 right-4 bg-black bg-opacity-70 p-2 rounded-full hover:bg-opacity-90"
                    >
                      <FaCompress size={18} />
                    </button>
                  </div>
                ) : (
                  remoteStreams.map(
                    ({ stream, name, id }) =>
                      id === fullScreenVideo && (
                        <div
                          key={id}
                          className="relative h-full"
                          style={{
                            aspectRatio: videoDimensions["local"]
                              ? `${videoDimensions["local"].width}/${videoDimensions["local"].height}`
                              : "16/9",
                            maxWidth: "100%",
                            maxHeight: "100%",
                          }}
                        >
                          {renderVideo(stream, id, name)}
                          <button
                            onClick={() => toggleFullScreen(id)}
                            className="absolute top-4 right-4 bg-black bg-opacity-70 p-2 rounded-full hover:bg-opacity-90"
                          >
                            <FaCompress size={18} />
                          </button>
                        </div>
                      )
                  )
                )}
              </div>

              {/* Thumbnail sidebar - takes 20% width with smooth scrolling */}
              <div className="w-1/5 h-full bg-gray-900 bg-opacity-90 border-l border-gray-700 overflow-y-auto p-2 flex flex-col space-y-3">
                {/* Local video thumbnail */}
                <div
                  className={`relative aspect-video cursor-pointer rounded-lg overflow-hidden transition-all ${
                    fullScreenVideo === "local"
                      ? "ring-2 ring-blue-500"
                      : "hover:ring-1 hover:ring-gray-500"
                  }`}
                  onClick={() => toggleFullScreen("local")}
                >
                  {renderVideo(
                    localStream.current,
                    "local-thumb",
                    userName,
                    true
                  )}
                  {!videoEnabled && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-60">
                      <FaVideoSlash size={16} />
                    </div>
                  )}
                </div>

                {/* Remote video thumbnails */}
                {remoteStreams.map(({ stream, name, id }) => (
                  <div
                    key={id}
                    className={`relative aspect-video cursor-pointer rounded-lg overflow-hidden transition-all ${
                      fullScreenVideo === id
                        ? "ring-2 ring-blue-500"
                        : "hover:ring-1 hover:ring-gray-500"
                    }`}
                    onClick={() => toggleFullScreen(id)}
                  >
                    {renderVideo(stream, `thumb-${id}`, name)}
                    {participantStates[id]?.video === false && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-60">
                        <FaVideoSlash size={16} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Grid view */}
          {!fullScreenVideo && (
            <div className="flex-1 p-4 overflow-auto">
              <div
                className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4`}
              >
                {/* Local video */}
                <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
                  {renderVideo(
                    localStream.current,
                    "local-grid",
                    userName,
                    true
                  )}
                  <button
                    onClick={() => toggleFullScreen("local")}
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

                {/* Remote videos */}
                {remoteStreams.map(({ stream, name, id }) => (
                  <div
                    key={id}
                    className="relative bg-black rounded-lg overflow-hidden aspect-video"
                  >
                    {renderVideo(stream, id, name)}
                    <button
                      onClick={() => toggleFullScreen(id)}
                      className="absolute top-2 right-2 bg-black bg-opacity-50 p-1 rounded-full hover:bg-opacity-70"
                    >
                      <FaExpand size={14} />
                    </button>
                    {participantStates[id]?.video === false && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                        <FaVideoSlash size={24} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Chat sidebar */}
        {showChat && (
          <div className="w-1/4 bg-gray-800 border-l border-gray-700 flex flex-col">
            <div className="p-4 border-b border-gray-700">
              <h2 className="font-semibold">Chat</h2>
            </div>
            <div
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto p-4 space-y-4"
            >
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${
                    msg.sender === userName ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-xs p-3 rounded-tl-xl  ${
                      msg.sender === userName
                        ? "bg-blue-600 rounded-tr-xl rounded-bl-xl"
                        : msg.sender === "Admin"
                        ? "bg-gray-600 rounded-tr-xl rounded-br-xl"
                        : "bg-gray-700 rounded-tr-xl rounded-br-xl"
                    }`}
                  >
                    {msg.sender === userName ? (
                      <div className="font-semibold text-sm">You</div>
                    ) : (
                      <div className="font-semibold text-sm">{msg.sender}</div>
                    )}
                    <div className="text-sm">{msg.text}</div>
                    <div className="text-xs text-gray-300 mt-1">{msg.time}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-gray-700">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 bg-gray-700 rounded px-3 py-2 text-sm"
                />
                <button
                  onClick={sendMessage}
                  className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Controls footer */}
      <footer className="bg-gray-800 py-3 px-6 border-t border-gray-700">
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => setShowChat(!showChat)}
            className={`p-3 pl-5 pr-5 rounded-full ${
              !showChat
                ? "bg-gray-700 hover:bg-gray-600"
                : "bg-blue-600 hover:bg-blue-700"
            } flex flex-col items-center`}
          >
            <FaComments />
            <span className="text-xs mt-1">Chat</span>
          </button>

          <button
            onClick={toggleVideo}
            className={`p-3 rounded-full ${
              videoEnabled
                ? "bg-gray-700 hover:bg-gray-600"
                : "bg-red-500 hover:bg-red-600"
            } flex flex-col items-center`}
          >
            {videoEnabled ? <FaVideo size={20} /> : <FaVideoSlash size={20} />}
            <span className="text-xs mt-1">
              {videoEnabled ? "Stop Video" : "Start Video"}
            </span>
          </button>

          <button
            onClick={toggleScreenShare}
            className={`p-3 rounded-full ${
              screenSharing
                ? "bg-red-500 hover:bg-red-600"
                : "bg-gray-700 hover:bg-gray-600"
            } flex flex-col items-center`}
          >
            <FaDesktop size={20} />
            <span className="text-xs mt-1">
              {screenSharing ? "Stop Share" : "Share Screen"}
            </span>
          </button>

          <button
            onClick={copyRoomID}
            className="p-3 rounded-full bg-gray-700 hover:bg-gray-600 flex flex-col items-center"
          >
            <FaCopy size={20} />
            <span className="text-xs mt-1">Copy ID</span>
          </button>

          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="p-3 rounded-full bg-red-700 hover:bg-red-800 flex flex-col items-center"
          >
            <FaSignOutAlt size={20} />
            <span className="text-xs mt-1">Leave</span>
          </button>
        </div>
      </footer>

      {/* leave- popup */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-gray-800 rounded-xl shadow-2xl border border-gray-700 p-6 max-w-sm w-full">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-xl font-bold">Confirmation!!!</h3>
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
              Are you sure, you want to leave the room?
            </p>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="px-4 py-2 border border-gray-600 text-gray-300 hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleLeftRoom}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Leave
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
