"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

export enum StreamingAvatarSessionState {
  INACTIVE = "inactive",
  CONNECTING = "connecting",
  CONNECTED = "connected",
  ERROR = "error",
}

interface StreamingAvatarContextType {
  sessionState: StreamingAvatarSessionState;
  setSessionState: (sessionState: StreamingAvatarSessionState) => void;
}

const StreamingAvatarContext = createContext<
  StreamingAvatarContextType | undefined
>(undefined);

export const StreamingAvatarProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [sessionState, setSessionState] = useState<StreamingAvatarSessionState>(
    StreamingAvatarSessionState.INACTIVE,
  );

  return (
    <StreamingAvatarContext.Provider value={{ sessionState, setSessionState }}>
      {children}
    </StreamingAvatarContext.Provider>
  );
};

export const useStreamingAvatarContext = () => {
  const context = useContext(StreamingAvatarContext);

  if (!context) {
    throw new Error(
      "useStreamingAvatarContext must be used within a StreamingAvatarProvider",
    );
  }

  return context;
}; 