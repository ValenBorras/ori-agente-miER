import React, { forwardRef } from "react";

export const MinimalistAvatarVideo = forwardRef<HTMLVideoElement>(({}, ref) => {
  return (
    <video
      ref={ref}
      autoPlay
      playsInline
      style={{
        width: "100%",
        height: "100%",
        objectFit: "contain",
      }}
    >
      <track kind="captions" />
    </video>
  );
});

MinimalistAvatarVideo.displayName = "MinimalistAvatarVideo"; 