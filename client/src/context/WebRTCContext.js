import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import { addMessage, updateParticipants } from "../slices/roomSlice";
import Peer from "simple-peer";
import io from "socket.io-client";

const WebRTCContext = createContext();

export const WebRTCProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [peers, setPeers] = useState({});
  const [stream, setStream] = useState(null);
  const [screenStream, setScreenStream] = useState(null);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const peersRef = useRef({});
  const userVideo = useRef();
  const screenVideo = useRef();
  const currentUser = useSelector((state) => state.auth.user);
  const roomId = useSelector((state) => state.room.currentRoom);
  const dispatch = useDispatch();

  useEffect(() => {
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);
  
    return () => {
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!socket || !currentUser || !roomId) return;
  
    const handleMessage = (message) => dispatch(addMessage(message));
    const handleRoomUsers = ({ users }) => dispatch(updateParticipants(users));
  
    socket.emit('joinRoom', { roomId, user: currentUser });
    socket.on('message', handleMessage);
    socket.on('roomUsers', handleRoomUsers);
    socket.on('offer', handleReceiveCall);
    socket.on('answer', handleAnswer);
    socket.on('ice-candidate', handleNewICECandidate);
  
    return () => {
      socket.off('message', handleMessage);
      socket.off('roomUsers', handleRoomUsers);
      socket.off('offer', handleReceiveCall);
      socket.off('answer', handleAnswer);
      socket.off('ice-candidate', handleNewICECandidate);
    };
  }, [socket, currentUser, roomId, dispatch]); 

  const startMedia = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setStream(mediaStream);
      if (userVideo.current) {
        userVideo.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Error accessing media devices:", err);
    }
  };

  const stopMedia = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const toggleAudio = () => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
      }
    }
  };

  const toggleVideo = () => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
      }
    }
  };

  const shareScreen = async () => {
    if (isScreenSharing) {
      if (screenStream) {
        screenStream.getTracks().forEach((track) => track.stop());
        setScreenStream(null);
      }
      setIsScreenSharing(false);
      return;
    }

    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
      });
      setScreenStream(screenStream);
      setIsScreenSharing(true);

      if (screenVideo.current) {
        screenVideo.current.srcObject = screenStream;
      }

      // Replace video track for all peers
      Object.values(peersRef.current).forEach((peer) => {
        peer.replaceTrack(
          peer.streams[0].getVideoTracks()[0],
          screenStream.getVideoTracks()[0],
          peer.streams[0]
        );
      });

      screenStream.getVideoTracks()[0].onended = () => {
        shareScreen();
      };
    } catch (err) {
      console.error("Error sharing screen:", err);
    }
  };

  const handleReceiveCall = useCallback((data) => {
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream: isScreenSharing ? screenStream : stream,
    });

    peer.on("signal", (signal) => {
      socket.emit("answer", { signal, target: data.from });
    });

    peer.on("stream", (stream) => {
      peersRef.current[data.from].stream = stream;
      setPeers({ ...peersRef.current });
    });

    peer.signal(data.signal);

    peersRef.current[data.from] = peer;
    setPeers({ ...peersRef.current });
  }, [isScreenSharing, screenStream, stream]);

  const handleAnswer = useCallback((data) => {
    const peer = peersRef.current[data.from];
    if (peer) {
      peer.signal(data.signal);
    }
  }, []);

  const handleNewICECandidate = useCallback((data) => {
    const peer = peersRef.current[data.from];
    if (peer) {
      peer.addIceCandidate(new RTCIceCandidate(data));
    }
  }, []);

  const callPeer = useCallback((socketId) => {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream: isScreenSharing ? screenStream : stream,
    });

    peer.on("signal", (signal) => {
      socket.emit("offer", { signal, target: socketId });
    });

    peer.on("stream", (stream) => {
      peersRef.current[socketId].stream = stream;
      setPeers({ ...peersRef.current });
    });

    peer.on("ice-candidate", (candidate) => {
      socket.emit("ice-candidate", { candidate, target: socketId });
    });

    peersRef.current[socketId] = peer;
    setPeers({ ...peersRef.current });
  }, [socket, isScreenSharing, screenStream, stream]);

  const leaveCall = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    if (screenStream) {
      screenStream.getTracks().forEach((track) => track.stop());
      setScreenStream(null);
    }
    Object.values(peersRef.current).forEach((peer) => peer.destroy());
    peersRef.current = {};
    setPeers({});
    setIsScreenSharing(false);
  };

  const sendMessage = (message) => {
    if (socket && message.trim()) {
      socket.emit("chatMessage", message.trim());
    }
  };

  return (
    <WebRTCContext.Provider
      value={{
        socket,
        peers,
        stream,
        screenStream,
        isScreenSharing,
        userVideo,
        screenVideo,
        startMedia,
        stopMedia,
        toggleAudio,
        toggleVideo,
        shareScreen,
        callPeer,
        leaveCall,
        sendMessage,
      }}
    >
      {children}
    </WebRTCContext.Provider>
  );
};

export const useWebRTC = () => {
  return useContext(WebRTCContext);
};
