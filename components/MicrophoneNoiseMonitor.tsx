import React, { useEffect, useState, useCallback } from 'react';
import { useMicrophone } from './logic/useMicrophone';
import { useKeyboardShortcuts } from './logic/useKeyboardShortcuts';
import { AudioLevelIndicator } from './AudioLevelIndicator';
import { MuteButton } from './MuteButton';
import { PermissionPrompt } from './PermissionPrompt';

interface MicrophoneNoiseMonitorProps {
  onMuteToggle?: (isMuted: boolean) => void;
  onAudioLevel?: (level: number) => void;
  sensitivity?: number; // 1-10, default 5
  showMuteButton?: boolean; // default true
  variant?: 'bars' | 'circle' | 'pulse';
  size?: 'small' | 'medium' | 'large';
  autoStart?: boolean; // default false
  className?: string;
}

export function MicrophoneNoiseMonitor({
  onMuteToggle,
  onAudioLevel,
  sensitivity = 5,
  showMuteButton = true,
  variant = 'bars',
  size = 'medium',
  autoStart = false,
  className = ''
}: MicrophoneNoiseMonitorProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [isActive, setIsActive] = useState(false);

  const {
    isListening,
    hasPermission,
    isSupported,
    audioLevel,
    error,
    requestPermission,
    startListening,
    stopListening
  } = useMicrophone({
    sensitivity,
    fftSize: 256,
    updateFrequency: 60
  });

  // Handle mute toggle
  const handleMuteToggle = useCallback(() => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    
    if (newMutedState) {
      // Muted - stop listening
      stopListening();
      setIsActive(false);
    } else {
      // Unmuted - start listening if we have permission
      if (hasPermission) {
        startListening();
        setIsActive(true);
      } else {
        requestPermission().then((granted) => {
          if (granted) {
            startListening();
            setIsActive(true);
          }
        });
      }
    }
    
    onMuteToggle?.(newMutedState);
  }, [isMuted, hasPermission, stopListening, startListening, requestPermission, onMuteToggle]);

  // Handle audio level changes
  useEffect(() => {
    const level = isMuted ? 0 : audioLevel;
    onAudioLevel?.(level);
  }, [audioLevel, isMuted, onAudioLevel]);

  // Auto-start functionality
  useEffect(() => {
    if (autoStart && hasPermission && !isMuted && !isActive) {
      startListening();
      setIsActive(true);
    }
  }, [autoStart, hasPermission, isMuted, isActive, startListening]);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onMuteToggle: handleMuteToggle,
    enabled: isSupported && hasPermission
  });

  // Determine if we should show permission prompt
  const shouldShowPermissionPrompt = !isSupported || (!hasPermission && !error);

  // Determine if we should show the main interface
  const shouldShowMainInterface = isSupported && (hasPermission || error);

  return (
    <div className={`flex flex-col items-center gap-4 ${className}`}>
      {/* Permission Prompt */}
      {shouldShowPermissionPrompt && (
        <PermissionPrompt
          onRequestPermission={requestPermission}
          error={error}
          isSupported={isSupported}
        />
      )}

      {/* Main Interface */}
      {shouldShowMainInterface && (
        <div className="flex flex-col items-center gap-4">
          {/* Audio Level Indicator */}
          <div className="flex flex-col items-center gap-2">
            <AudioLevelIndicator
              audioLevel={isMuted ? 0 : audioLevel}
              isListening={isListening && !isMuted}
              isMuted={isMuted}
              variant={variant}
              size={size}
            />
            
            {/* Status text */}
            <div className="text-center">
              {isMuted ? (
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Microphone muted
                </span>
              ) : isListening ? (
                <span className="text-sm text-green-600 dark:text-green-400">
                  Listening...
                </span>
              ) : hasPermission ? (
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Click to start listening
                </span>
              ) : (
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Microphone ready
                </span>
              )}
            </div>
          </div>

          {/* Mute Button */}
          {showMuteButton && (
            <MuteButton
              isMuted={isMuted}
              onToggle={handleMuteToggle}
              disabled={!isSupported}
              size={size}
              showLabel={true}
            />
          )}

          {/* Manual start button (when not auto-starting) */}
          {!autoStart && hasPermission && !isMuted && !isActive && (
            <button
              onClick={() => {
                startListening();
                setIsActive(true);
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Start Listening
            </button>
          )}

          {/* Error display */}
          {error && (
            <div className="text-xs text-red-500 dark:text-red-400 text-center max-w-xs">
              {error}
            </div>
          )}
        </div>
      )}
    </div>
  );
} 