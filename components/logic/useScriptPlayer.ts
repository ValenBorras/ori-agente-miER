import { useCallback, useEffect, useRef, useState } from 'react';
import { Script, ScriptMessage, ScriptPlayerState } from '@/types/script';
import { useTextChat } from './useTextChat';
import { useStreamingAvatarContext } from './context';

export const useScriptPlayer = (script: Script) => {
  const [playerState, setPlayerState] = useState<ScriptPlayerState>({
    isPlaying: false,
    currentMessageIndex: 0,
    isPaused: false,
    progress: 0,
  });

  const { repeatMessageSync } = useTextChat();
  const { avatarRef } = useStreamingAvatarContext();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const isPlayingRef = useRef(false);

  const calculateProgress = useCallback(() => {
    if (script.messages.length === 0) return 0;
    return Math.round((playerState.currentMessageIndex / script.messages.length) * 100);
  }, [playerState.currentMessageIndex, script.messages.length]);

  const playNextMessage = useCallback(async () => {
    if (!isPlayingRef.current || playerState.currentMessageIndex >= script.messages.length) {
      // Script completed or stopped
      if (playerState.currentMessageIndex >= script.messages.length) {
        setPlayerState(prev => ({
          ...prev,
          isPlaying: false,
          currentMessageIndex: 0,
          progress: 0,
        }));
      }
      return;
    }

    const currentMessage = script.messages[playerState.currentMessageIndex];
    
    if (currentMessage.speaker === 'Jujo') {
      // Jujo speaks
      try {
        console.log('Jujo speaking:', currentMessage.content);
        await repeatMessageSync(currentMessage.content);
      } catch (error) {
        console.error('Error making Jujo speak:', error);
      }
      
      // Move to next message after a short delay
      timeoutRef.current = setTimeout(() => {
        if (isPlayingRef.current) {
          setPlayerState(prev => ({
            ...prev,
            currentMessageIndex: prev.currentMessageIndex + 1,
            progress: Math.round(((prev.currentMessageIndex + 1) / script.messages.length) * 100),
          }));
        }
      }, 2000); // 2 second delay between messages
    } else {
      // Rogelio's turn - wait for estimated duration
      const duration = currentMessage.estimatedDuration || 6; // default 6 seconds
      console.log(`Rogelio's turn - waiting ${duration} seconds`);
      
      timeoutRef.current = setTimeout(() => {
        if (isPlayingRef.current) {
          setPlayerState(prev => ({
            ...prev,
            currentMessageIndex: prev.currentMessageIndex + 1,
            progress: Math.round(((prev.currentMessageIndex + 1) / script.messages.length) * 100),
          }));
        }
      }, duration * 1000);
    }
  }, [playerState.currentMessageIndex, script.messages, repeatMessageSync]);

  const startScript = useCallback(() => {
    if (!avatarRef.current) {
      console.error('Avatar not connected');
      return;
    }

    isPlayingRef.current = true;
    setPlayerState({
      isPlaying: true,
      currentMessageIndex: 0,
      isPaused: false,
      progress: 0,
    });
    startTimeRef.current = Date.now();
  }, [avatarRef]);

  const pauseScript = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    isPlayingRef.current = false;
    setPlayerState(prev => ({
      ...prev,
      isPaused: true,
    }));
  }, []);

  const resumeScript = useCallback(() => {
    isPlayingRef.current = true;
    setPlayerState(prev => ({
      ...prev,
      isPaused: false,
    }));
  }, []);

  const stopScript = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    isPlayingRef.current = false;
    setPlayerState({
      isPlaying: false,
      currentMessageIndex: 0,
      isPaused: false,
      progress: 0,
    });
  }, []);

  const skipToMessage = useCallback((index: number) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setPlayerState(prev => ({
      ...prev,
      currentMessageIndex: index,
      progress: Math.round((index / script.messages.length) * 100),
    }));
  }, [script.messages.length]);

  // Effect to handle message progression
  useEffect(() => {
    if (playerState.isPlaying && !playerState.isPaused && avatarRef.current) {
      playNextMessage();
    }
  }, [playerState.isPlaying, playerState.isPaused, playerState.currentMessageIndex, playNextMessage, avatarRef]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      isPlayingRef.current = false;
    };
  }, []);

  const currentMessage = script.messages[playerState.currentMessageIndex] || null;
  const isCompleted = playerState.currentMessageIndex >= script.messages.length;

  return {
    playerState,
    currentMessage,
    isCompleted,
    startScript,
    pauseScript,
    resumeScript,
    stopScript,
    skipToMessage,
    progress: calculateProgress(),
  };
}; 