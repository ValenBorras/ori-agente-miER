/**
 * MinimalistElevenLabsAvatar Component
 *
 * This component implements the new architecture where:
 * - ElevenLabs Conversational AI is the PRIMARY conversation handler (brain)
 * - HeyGen Avatar serves as a visual puppet (face)
 *
 * Flow: User Voice/Text → ElevenLabs Agent → Text Response → HeyGen Avatar Display
 */

"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";

import { useMemoizedFn, useUnmount } from "ahooks";

import { Button } from "./Button";
import { LoadingIcon } from "./Icons";
import { HeyGenPuppet } from "./HeyGenPuppet";

import {
  ElevenLabsConversationService,
  createElevenLabsConversation,
  ConversationHandlers,
} from "@/lib/elevenLabsConversation";

export interface MinimalistElevenLabsAvatarProps {
  agentId: string;
  apiKey: string;
  className?: string;
}

enum ConversationState {
  INACTIVE = "inactive",
  CONNECTING = "connecting",
  CONNECTED = "connected",
  LISTENING = "listening",
  PROCESSING = "processing",
  RESPONDING = "responding",
  ERROR = "error",
}

function MinimalistElevenLabsAvatarComponent({
  agentId,
  apiKey,
  className = "",
}: MinimalistElevenLabsAvatarProps) {
  const [conversationState, setConversationState] = useState<ConversationState>(
    ConversationState.INACTIVE,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [lastUserMessage, setLastUserMessage] = useState("");
  const [lastAgentMessage, setLastAgentMessage] = useState("");
  const [isPuppetSpeaking, setIsPuppetSpeaking] = useState(false);
  const [isElevenLabsListening, setIsElevenLabsListening] = useState(false);
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);

  const conversationServiceRef = useRef<ElevenLabsConversationService | null>(
    null,
  );
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  /**
   * Audio level monitoring for visual feedback
   */
  const monitorAudio = useCallback(() => {
    if (
      !analyserRef.current ||
      isMuted ||
      conversationState !== ConversationState.LISTENING
    ) {
      setAudioLevel(0);
      setIsUserSpeaking(false);
      animationFrameRef.current = requestAnimationFrame(monitorAudio);

      return;
    }

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);

    analyserRef.current.getByteFrequencyData(dataArray);

    const volume = dataArray.reduce((a, b) => a + b) / dataArray.length;

    setAudioLevel(volume);

    // Detect if user is speaking (volume threshold)
    const isSpeaking = volume > 20; // Adjust threshold as needed

    setIsUserSpeaking(isSpeaking);

    animationFrameRef.current = requestAnimationFrame(monitorAudio);
  }, [isMuted, conversationState]);

  /**
   * Initialize audio monitoring for visual feedback
   */
  const initAudioMonitoring = useCallback(async () => {
    try {
      if (!mediaStreamRef.current) {
        mediaStreamRef.current = await navigator.mediaDevices.getUserMedia({
          audio: {
            sampleRate: 16000,
            channelCount: 1,
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });
      }

      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }

      if (!analyserRef.current) {
        const source = audioContextRef.current.createMediaStreamSource(
          mediaStreamRef.current,
        );

        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 256;
        source.connect(analyserRef.current);
      }

      monitorAudio();
    } catch (error) {
      console.error("Error initializing audio monitoring:", error);
    }
  }, [monitorAudio]);

  /**
   * ElevenLabs conversation event handlers
   */
  const handleUserTranscript = useCallback((transcript: string) => {
    console.log(
      `⏱️ [${new Date().toISOString()}] USER_TRANSCRIPT: "${transcript}"`,
    );
    setLastUserMessage(transcript);
    setConversationState(ConversationState.PROCESSING);
  }, []);

  const handleAgentResponse = useCallback(async (response: string) => {
    const responseTime = new Date().toISOString();

    console.log(`⏱️ [${responseTime}] AGENT_RESPONSE: "${response}"`);
    setLastAgentMessage(response);

    // Measure HeyGen speak timing
    try {
      const speakStartTime = performance.now();

      console.log(`⏱️ [${new Date().toISOString()}] HEYGEN_SPEAK_START`);

      await (window as any).heygenPuppet.speak(response);

      const speakEndTime = performance.now();
      const speakDuration = speakEndTime - speakStartTime;

      console.log(
        `⏱️ [${new Date().toISOString()}] HEYGEN_SPEAK_END - Duration: ${speakDuration.toFixed(2)}ms`,
      );
    } catch (error) {
      console.error("❌ Error making puppet speak:", error);
    }
  }, []);

  const handleConnect = useCallback(() => {
    setConversationState(ConversationState.LISTENING);
    setIsElevenLabsListening(true);
    initAudioMonitoring();
  }, [initAudioMonitoring]);

  const handleDisconnect = useCallback(() => {
    setConversationState(ConversationState.INACTIVE);
    setIsElevenLabsListening(false);

    // Clean up audio monitoring
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    setAudioLevel(0);
  }, []);

  const handleError = useCallback((error: Error) => {
    console.error("❌ ElevenLabs conversation error:", error);
    setConversationState(ConversationState.ERROR);
  }, []);

  const handleInterruption = useCallback((_reason: string) => {
    // Interrupt HeyGen puppet immediately
    if ((window as any).heygenPuppet?.interrupt) {
      try {
        (window as any).heygenPuppet.interrupt();
      } catch (error) {
        console.error("❌ Error interrupting HeyGen puppet:", error);
      }
    }

    // Reset speaking state
    setIsPuppetSpeaking(false);
  }, []);

  const handleUserSpeaking = useCallback((isSpeaking: boolean) => {
    setIsUserSpeaking(isSpeaking);
  }, []);

  /**
   * Start the conversation (ElevenLabs as primary handler)
   */
  const startConversation = useMemoizedFn(async () => {
    if (conversationState !== ConversationState.INACTIVE) {
      console.warn("⚠️ Conversation already active");

      return;
    }

    try {
      setIsLoading(true);
      setConversationState(ConversationState.CONNECTING);

      // Step 1: Initialize HeyGen puppet first
      if ((window as any).heygenPuppet?.initialize) {
        try {
          await (window as any).heygenPuppet.initialize();
        } catch (error) {
          console.error("❌ Error initializing HeyGen puppet:", error);
          throw error;
        }
      }

      // Step 2: Start ElevenLabs conversation immediately

      const handlers: ConversationHandlers = {
        onUserTranscript: handleUserTranscript,
        onAgentResponse: handleAgentResponse,
        onConnect: handleConnect,
        onDisconnect: handleDisconnect,
        onError: handleError,
        onInterruption: handleInterruption,
        onUserSpeaking: handleUserSpeaking,
      };

      conversationServiceRef.current = createElevenLabsConversation(
        agentId,
        apiKey,
        handlers,
      );

      await conversationServiceRef.current.startConversation();
      setIsLoading(false);
    } catch (error) {
      console.error("❌ Failed to start conversation:", error);
      setConversationState(ConversationState.ERROR);
      setIsLoading(false);
    }
  });

  /**
   * Stop the conversation
   */
  const stopConversation = useMemoizedFn(async () => {
    try {
      // Stop ElevenLabs conversation
      if (conversationServiceRef.current) {
        await conversationServiceRef.current.stopConversation();
        conversationServiceRef.current = null;
      }

      // Stop HeyGen puppet
      if ((window as any).heygenPuppet?.stop) {
        await (window as any).heygenPuppet.stop();
      }

      setConversationState(ConversationState.INACTIVE);
      setLastUserMessage("");
      setLastAgentMessage("");

      // Clean up audio monitoring
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      setAudioLevel(0);
      setIsUserSpeaking(false);
    } catch (error) {
      console.error("❌ Error stopping conversation:", error);
    }
  });

  /**
   * Toggle microphone mute (for audio monitoring, not ElevenLabs streaming)
   */
  const handleMuteToggle = useCallback(() => {
    setIsMuted(!isMuted);
    console.log("🎤 Microphone", !isMuted ? "muted" : "unmuted");
  }, [isMuted]);

  /**
   * HeyGen puppet event handlers
   */
  const handlePuppetReady = useCallback(() => {
    // Ready
  }, []);

  const handlePuppetSpeakingStart = useCallback(() => {
    setIsPuppetSpeaking(true);
  }, []);

  const handlePuppetSpeakingEnd = useCallback(() => {
    setIsPuppetSpeaking(false);
  }, []);

  const handlePuppetError = useCallback((error: Error) => {
    console.error("❌ HeyGen puppet error:", error);
  }, []);

  /**
   * Cleanup on unmount
   */
  useUnmount(() => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
    }
  });

  /**
   * Render conversation status
   */
  const renderStatus = () => {
    switch (conversationState) {
      case ConversationState.LISTENING:
        return (
          <div className="text-green-400 text-xs sm:text-sm">
            ✓ Listening...
          </div>
        );
      case ConversationState.PROCESSING:
        return (
          <div className="text-blue-400 text-xs sm:text-sm">
            🧠 Processing...
          </div>
        );
      case ConversationState.RESPONDING:
        return (
          <div className="text-purple-400 text-xs sm:text-sm">
            💬 Responding...
          </div>
        );
      case ConversationState.ERROR:
        return <div className="text-red-400 text-xs sm:text-sm">❌ Error</div>;
      default:
        return null;
    }
  };

  /**
   * Render audio level indicator
   */
  const renderAudioIndicator = () => (
    <button
      className={`w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all duration-200 border-2 ${
        isMuted
          ? "bg-red-500 border-red-500 hover:bg-red-600"
          : isUserSpeaking
            ? "bg-green-500 border-green-500"
            : "bg-white border-gray-300 hover:border-gray-400"
      }`}
      title={
        isUserSpeaking
          ? "Usuario hablando"
          : isMuted
            ? "Micrófono silenciado"
            : "Micrófono activo"
      }
      onClick={handleMuteToggle}
    >
      <div className="flex items-end gap-0.5 h-2 sm:h-3 md:h-4">
        {[1, 2, 3, 4].map((bar) => (
          <div
            key={bar}
            className={`w-0.5 sm:w-0.5 md:w-1 rounded-full transition-all duration-100 ${
              isMuted
                ? "bg-white"
                : isUserSpeaking
                  ? "bg-white"
                  : audioLevel > bar * 15
                    ? "bg-green-500"
                    : "bg-gray-400"
            }`}
            style={{
              height: `${bar * 1.5}px`,
              opacity: isMuted
                ? 0.8
                : isUserSpeaking
                  ? 1
                  : audioLevel > bar * 15
                    ? 1
                    : 0.4,
            }}
          />
        ))}
      </div>
    </button>
  );

  return (
    <div
      className={`w-full flex flex-col items-center justify-center gap-3 sm:gap-4 px-4 sm:px-0 ${className}`}
    >
      {/* Avatar Container with Frame */}
      <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-md lg-max-w-lg aspect-[5/6] flex flex-col items-center justify-center">
        {/* Frame Overlay */}
        <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center">
          <img
            alt="Avatar Frame"
            className="w-full h-full object-contain"
            src="/JUJO_FRAME.webp"
            style={{
              transform: "rotate(90deg) scale(1.30)",
            }}
          />
        </div>

        {/* HeyGen Puppet Container */}
        <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
          <div className="w-[80%] h-[80%] overflow-hidden rounded-lg">
            <HeyGenPuppet
              className="rounded-lg"
              onError={handlePuppetError}
              onReady={handlePuppetReady}
              onSpeakingEnd={handlePuppetSpeakingEnd}
              onSpeakingStart={handlePuppetSpeakingStart}
            />
          </div>
        </div>




      </div>

      {/* Control Panel */}
      <div className="flex justify-center w-full px-4 sm:px-0 mt-2">
        {conversationState === ConversationState.INACTIVE && !isLoading ? (
          <div className="flex flex-col gap-3 w-full max-w-xs">
            <Button
              className="px-6 sm:px-8 py-2 sm:py-3 text-base sm:text-lg font-medium w-full mt-2"
              onClick={startConversation}
            >
              Comenzar Conversación
            </Button>
            
          </div>
        ) : isLoading || conversationState === ConversationState.CONNECTING ? (
          <div className="flex items-center gap-2 text-white mt-4 sm:mt-3 text-sm sm:text-base">
            <LoadingIcon />
            <span>Conectando con JUJO</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 sm:gap-2 mt-4 sm:mt-3 w-full">
            {renderStatus()}

            {/* Control Buttons */}
            <div className="flex items-center justify-center gap-2 sm:gap-3 w-full">
              {/* Audio Level Indicator */}
              {renderAudioIndicator()}

              {/* Microphone Button */}
              <button
                className={`w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all duration-200 border-2 ${
                  isMuted
                    ? "bg-red-500 border-red-500 hover:bg-red-600"
                    : "bg-white border-gray-300 hover:border-gray-400"
                }`}
                onClick={handleMuteToggle}
              >
                <svg
                  className={`w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 ${
                    isMuted ? "text-white" : "text-gray-700"
                  }`}
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                  <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                </svg>
              </button>

              {/* End Call Button */}
              <button
                className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center transition-all duration-200 border-2 border-red-600"
                title="Terminar conversación"
                onClick={stopConversation}
              >
                <svg
                  className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-white rotate-180"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                </svg>
              </button>
            </div>

            {/* Last Messages Display */}
            {(lastUserMessage || lastAgentMessage) && (
              <div className="w-full max-w-md bg-black bg-opacity-30 rounded-lg p-3 text-xs text-white">
                {lastUserMessage && (
                  <div className="mb-2">
                    <strong>Usuario:</strong> {lastUserMessage}
                  </div>
                )}
                {lastAgentMessage && (
                  <div>
                    <strong>JUJO:</strong> {lastAgentMessage}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * MinimalistElevenLabsAvatar with Configuration Fetching
 */
export default function MinimalistElevenLabsAvatar() {
  const [config, setConfig] = useState<{
    agentId: string;
    apiKey: string;
  } | null>(null);
  const [configError, setConfigError] = useState<string | null>(null);
  const [isLoadingConfig, setIsLoadingConfig] = useState(true);

  // Fetch configuration on mount
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        // Get agent ID from public endpoint
        const configResponse = await fetch("/api/elevenlabs-config");
        const configData = await configResponse.json();

        if (!configResponse.ok) {
          throw new Error(configData.error || "Failed to get configuration");
        }

        // Get API key from secure endpoint
        const keyResponse = await fetch("/api/elevenlabs-config", {
          method: "POST",
        });
        const keyData = await keyResponse.json();

        if (!keyResponse.ok) {
          throw new Error(keyData.error || "Failed to get API key");
        }

        setConfig({
          agentId: configData.agentId,
          apiKey: keyData.apiKey,
        });
      } catch (error) {
        console.error("Error fetching ElevenLabs configuration:", error);
        setConfigError(
          error instanceof Error ? error.message : "Configuration error",
        );
      } finally {
        setIsLoadingConfig(false);
      }
    };

    fetchConfig();
  }, []);

  if (isLoadingConfig) {
    return (
      <div className="w-full flex flex-col items-center justify-center gap-4 p-8">
        <LoadingIcon />
        <div className="text-white text-center">Loading configuration...</div>
      </div>
    );
  }

  if (configError || !config) {
    return (
      <div className="w-full flex flex-col items-center justify-center gap-4 p-8">
        <div className="text-red-500 text-center">❌ Configuration Error</div>
        <div className="text-gray-400 text-sm text-center">
          {configError || "Failed to load ElevenLabs configuration"}
        </div>
        <div className="text-gray-400 text-xs text-center max-w-md">
          Please ensure ELEVENLABS_API_KEY and NEXT_PUBLIC_ELEVENLABS_AGENT_ID
          are set in your .env.local file
        </div>
      </div>
    );
  }

  return (
    <MinimalistElevenLabsAvatarComponent
      agentId={config.agentId}
      apiKey={config.apiKey}
    />
  );
}
