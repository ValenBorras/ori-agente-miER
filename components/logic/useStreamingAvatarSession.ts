"use client";

import { useCallback, useRef, useState } from "react";
import StreamingAvatar, {
  StartAvatarRequest,
  StreamingEvents,
  TaskType,
} from "@heygen/streaming-avatar";
import { useMemoizedFn } from "ahooks";

import { StreamingAvatarSessionState } from "./context";

export const useStreamingAvatarSession = () => {
  const [sessionState, setSessionState] = useState<StreamingAvatarSessionState>(
    StreamingAvatarSessionState.INACTIVE,
  );
  const [stream, setStream] = useState<MediaStream | null>(null);
  const avatarRef = useRef<StreamingAvatar | null>(null);

  const initAvatar = useCallback((token: string) => {
    if (avatarRef.current) {
      avatarRef.current.stopAvatar();
    }

    const avatar = new StreamingAvatar({ token });
    avatarRef.current = avatar;

    // Set up event listeners
    avatar.on(StreamingEvents.STREAM_READY, (event) => {
      console.log("Stream ready:", event);
      setStream(event.detail);
      setSessionState(StreamingAvatarSessionState.CONNECTED);
    });

    avatar.on(StreamingEvents.STREAM_DISCONNECTED, () => {
      console.log("Stream disconnected");
      setStream(null);
      setSessionState(StreamingAvatarSessionState.INACTIVE);
    });

    avatar.on(StreamingEvents.AVATAR_START_TALKING, () => {
      console.log("Avatar started talking");
    });

    avatar.on(StreamingEvents.AVATAR_STOP_TALKING, () => {
      console.log("Avatar stopped talking");
    });
  }, []);

  const startAvatar = useMemoizedFn(async (config: StartAvatarRequest) => {
    if (!avatarRef.current) {
      throw new Error("Avatar not initialized");
    }

    setSessionState(StreamingAvatarSessionState.CONNECTING);

    try {
      await avatarRef.current.newSession(config);
      await avatarRef.current.startSession();
    } catch (error) {
      console.error("Error starting avatar:", error);
      setSessionState(StreamingAvatarSessionState.ERROR);
      throw error;
    }
  });

  const stopAvatar = useCallback(async () => {
    if (avatarRef.current) {
      await avatarRef.current.stopAvatar();
      setSessionState(StreamingAvatarSessionState.INACTIVE);
    }
  }, []);

  const speak = useCallback(
    async (text: string) => {
      if (
        !avatarRef.current ||
        sessionState !== StreamingAvatarSessionState.CONNECTED
      ) {
        throw new Error("Avatar not ready");
      }

      await avatarRef.current.speak({
        text,
        task_type: TaskType.REPEAT,
      });
    },
    [sessionState],
  );

  return {
    initAvatar,
    startAvatar,
    stopAvatar,
    speak,
    sessionState,
    stream,
    avatarRef,
  };
}; 