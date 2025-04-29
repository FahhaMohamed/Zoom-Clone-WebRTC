import React from "react";

const VideoPlayer = ({ stream, isMuted, isLocal }) => {
  const videoRef = React.useRef();

  React.useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div
      className="relative bg-black rounded-lg overflow-hidden"
      style={{ width: "100%", height: "100%" }}
    >
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isMuted}
        className="w-full h-full object-cover"
      />
      {isLocal && (
        <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
          You
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
