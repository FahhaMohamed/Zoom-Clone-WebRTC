import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
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

  // connect socket once
  useEffect(() => {
    const newSocket = io("http://127.0.0.1:5000");
    setSocket(newSocket);
    return () => newSocket.disconnect();
  }, []);

  // handle socket events
  useEffect(() => {
    if (!socket || !currentUser || !roomId) return;

    socket.emit("joinRoom", { roomId, user: currentUser });

    // chat
    const onMessage = (message) => dispatch(addMessage(message));
    socket.on("message", onMessage);

    // participants: when someone joins, call them
    const onRoomUsers = ({ users }) => {
      // update Redux / UI
      dispatch(updateParticipants(users));
  
      // For each user, if not me and not already connected, call them:
      users.forEach(u => {
        if (u.id !== socket.id && !peersRef.current[u.id]) {
          callPeer(u.id);
        }
      });
    };

    socket.on("roomUsers", onRoomUsers);

    // WebRTC signals
    socket.on("offer", handleReceiveCall);
    socket.on("answer", handleAnswer);
    socket.on("ice-candidate", handleNewICECandidate);

    return () => {
      socket.off("message", onMessage);
      socket.off("roomUsers", onRoomUsers);
      socket.off("offer", handleReceiveCall);
      socket.off("answer", handleAnswer);
      socket.off("ice-candidate", handleNewICECandidate);
    };
  }, [socket, currentUser, roomId]);

  // get camera/mic
  const startMedia = async () => {
    const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    setStream(mediaStream);
    if (userVideo.current) userVideo.current.srcObject = mediaStream;
  };

  const stopMedia = () => {
    stream?.getTracks().forEach((t) => t.stop());
    setStream(null);
  };

  const toggleAudio = () => {
    const track = stream?.getAudioTracks()[0];
    if (track) track.enabled = !track.enabled;
  };
  const toggleVideo = () => {
    const track = stream?.getVideoTracks()[0];
    if (track) track.enabled = !track.enabled;
  };

  const shareScreen = async () => {
    if (isScreenSharing) {
      screenStream.getTracks().forEach(t => t.stop());
      setScreenStream(null);
      setIsScreenSharing(false);
      return;
    }
    const sStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
    setScreenStream(sStream);
    setIsScreenSharing(true);
    if (screenVideo.current) screenVideo.current.srcObject = sStream;
    // replace track on each peer
    Object.values(peersRef.current).forEach(peer => {
      peer.replaceTrack(
        stream.getVideoTracks()[0],
        sStream.getVideoTracks()[0],
        stream
      );
    });
    sStream.getVideoTracks()[0].onended = () => shareScreen();
  };

  // receive offer
  const handleReceiveCall = useCallback((data) => {
    const peer = new Peer({ initiator: false, trickle: true, stream });
    peer.on("signal", (signal) => socket.emit("answer", { signal, target: data.from }));
    peer.on("stream", (remoteStream) => updateRemoteStream(data.from, remoteStream));
    peer.signal(data.signal);
    peersRef.current[data.from] = peer;
    setPeers({ ...peersRef.current });
  }, [stream]);

  const handleAnswer = useCallback((data) => {
    peersRef.current[data.from]?.signal(data.signal);
  }, []);

  const handleNewICECandidate = useCallback((data) => {
    peersRef.current[data.from]?.addIceCandidate(new RTCIceCandidate(data.candidate));
  }, []);

  // initiate call
  const callPeer = useCallback((socketId) => {
    const peer = new Peer({ initiator: true, trickle: true, stream });
    peer.on("signal", (signal) => socket.emit("offer", { signal, target: socketId }));
    peer.on("stream", (remoteStream) => updateRemoteStream(socketId, remoteStream));
    peer.on("iceCandidate", (candidate) => socket.emit("ice-candidate", { candidate, target: socketId }));
    peersRef.current[socketId] = peer;
    setPeers({ ...peersRef.current });
  }, [stream]);

  const updateRemoteStream = (id, remoteStream) => {
    peersRef.current[id].stream = remoteStream;
    setPeers({ ...peersRef.current });
  };

  const leaveCall = () => {
    stopMedia();
    screenStream?.getTracks().forEach(t => t.stop());
    Object.values(peersRef.current).forEach(p => p.destroy());
    peersRef.current = {};
    setPeers({});
    setIsScreenSharing(false);
  };

  const sendMessage = (text) => {
    if (socket && text) socket.emit("chatMessage", text);
  };

  return (
    <WebRTCContext.Provider value={{ socket, peers, stream, screenStream, isScreenSharing, userVideo, screenVideo, startMedia, stopMedia, toggleAudio, toggleVideo, shareScreen, callPeer, leaveCall, sendMessage }}>
      {children}
    </WebRTCContext.Provider>
  );
};
export const useWebRTC = () => useContext(WebRTCContext);