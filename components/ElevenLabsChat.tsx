"use client";

import { useState, useEffect, useRef } from "react";
import { useConversation } from "@elevenlabs/react";
import { IoSend, IoCall } from "react-icons/io5";

interface ElevenLabsChatProps {
  agentId: string;
  title: string;
}

type Mode = "idle" | "voice" | "chat";

export default function ElevenLabsChat({
  agentId,
  title,
}: ElevenLabsChatProps) {
  const [messages, setMessages] = useState<
    Array<{ type: "user" | "agent"; text: string; timestamp: Date }>
  >([]);
  const [inputText, setInputText] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [mode, setMode] = useState<Mode>("idle");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const chatWebSocketRef = useRef<WebSocket | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const scrollLockRef = useRef<boolean>(false);

  const conversation = useConversation({
    onConnect: () => {
      setIsConnected(true);
      setError(null);
      console.log("Connected to ElevenLabs conversation");
    },
    onDisconnect: () => {
      setIsConnected(false);
      setMode("idle");
      setIsSpeaking(false); // Reset speaking status
      console.log("Disconnected from ElevenLabs conversation");
    },
    onMessage: (message: any) => {
      console.log("Received message:", message);

      // Handle different message types from the conversation
      if (message.source === "user") {
        // User message (from voice or text) - only show in chat mode
        if (mode === "chat") {
          setMessages((prev) => [
            ...prev,
            {
              type: "user",
              text:
                typeof message === "string" ? message : message.message || "",
              timestamp: new Date(),
            },
          ]);
        }
      } else if (message.source === "ai") {
        // AI agent response - only show in chat mode
        if (mode === "chat") {
          setMessages((prev) => [
            ...prev,
            {
              type: "agent",
              text:
                typeof message === "string" ? message : message.message || "",
              timestamp: new Date(),
            },
          ]);
        }
        // Update speaking status for voice mode
        setIsSpeaking(true);
      }
    },
    onError: (error: any) => {
      setError(error.message || "An error occurred");
      console.error("ElevenLabs conversation error:", error);
    },
  });

  // Sound meter component for voice mode
  const SoundMeter = ({ isActive }: { isActive: boolean }) => {
    const [volumeLevels, setVolumeLevels] = useState<number[]>([
      0, 0, 0, 0, 0, 0, 0, 0,
    ]);
    const [userVolume, setUserVolume] = useState<number>(0);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const microphoneRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const animationFrameRef = useRef<number | null>(null);

    useEffect(() => {
      // Initialize audio context for microphone input when in voice mode
      const initAudio = async () => {
        try {
          console.log("Initializing audio detection...");
          const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
          });

          audioContextRef.current = new AudioContext();
          analyserRef.current = audioContextRef.current.createAnalyser();
          analyserRef.current.fftSize = 1024; // Higher resolution for better sensitivity
          analyserRef.current.smoothingTimeConstant = 0.1; // Less smoothing for more responsive
          analyserRef.current.minDecibels = -100; // Much lower threshold for maximum sensitivity
          analyserRef.current.maxDecibels = -10;

          microphoneRef.current =
            audioContextRef.current.createMediaStreamSource(stream);
          microphoneRef.current.connect(analyserRef.current);

          console.log("Audio detection initialized successfully");

          // Start monitoring user audio
          const monitorUserAudio = () => {
            if (analyserRef.current) {
              const dataArray = new Uint8Array(
                analyserRef.current.frequencyBinCount,
              );

              analyserRef.current.getByteFrequencyData(dataArray);

              // Calculate volume for different frequency bands (8 bars = 8 frequency ranges)
              const bandSize = Math.floor(dataArray.length / 8);
              const frequencyBands = [];

              for (let i = 0; i < 8; i++) {
                const startIndex = i * bandSize;
                const endIndex = startIndex + bandSize;
                const bandData = dataArray.slice(startIndex, endIndex);

                // Calculate RMS for this frequency band
                const rms = Math.sqrt(
                  bandData.reduce((sum, value) => sum + value * value, 0) /
                    bandData.length,
                );
                const normalizedVolume = rms / 255; // Normalize to 0-1

                // Apply different sensitivity multipliers for each bar to balance them
                let sensitivityMultiplier = 8; // Default sensitivity

                // Reduce sensitivity for the first bar (low frequencies) and increase for others
                if (i === 0) {
                  sensitivityMultiplier = 3; // Much lower sensitivity for the leftmost bar
                } else if (i === 1) {
                  sensitivityMultiplier = 5; // Lower sensitivity for second bar
                } else if (i === 2) {
                  sensitivityMultiplier = 6; // Medium sensitivity for third bar
                } else if (i >= 3 && i <= 5) {
                  sensitivityMultiplier = 8; // Normal sensitivity for middle bars
                } else {
                  sensitivityMultiplier = 10; // Higher sensitivity for rightmost bars (high frequencies)
                }

                const smoothedVolume = Math.min(
                  1,
                  normalizedVolume * sensitivityMultiplier,
                );

                frequencyBands.push(smoothedVolume);
              }

              setVolumeLevels(frequencyBands);

              // Calculate overall volume for user detection
              const overallRms = Math.sqrt(
                dataArray.reduce((sum, value) => sum + value * value, 0) /
                  dataArray.length,
              );
              const overallVolume = overallRms / 255;
              const smoothedOverallVolume = Math.min(1, overallVolume * 1.5); // Reduced sensitivity for user detection

              setUserVolume(smoothedOverallVolume);

              // Debug log
              if (smoothedOverallVolume > 0.1) {
                console.log(
                  "User volume detected:",
                  Math.round(smoothedOverallVolume * 100) + "%",
                );
              }
            }

            animationFrameRef.current = requestAnimationFrame(monitorUserAudio);
          };

          monitorUserAudio();
        } catch (error) {
          console.error("Error accessing microphone:", error);
        }
      };

      // Only initialize audio when in voice mode
      if (mode === "voice") {
        initAudio();
      }

      // Cleanup function
      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        if (microphoneRef.current) {
          microphoneRef.current.disconnect();
        }
        if (audioContextRef.current) {
          audioContextRef.current.close();
        }
      };
    }, [mode]); // Depend on mode instead of isActive

    useEffect(() => {
      // Always monitor user volume when in voice mode, regardless of agent status
      if (!isActive && userVolume === 0) {
        setVolumeLevels([0, 0, 0, 0, 0, 0, 0, 0]);

        return;
      }

      // No need for interval since we're using real frequency data from the audio analyser
      // The volumeLevels are updated directly in the monitorUserAudio function
    }, [userVolume]); // Remove isActive dependency, only depend on userVolume

    return (
      <div className="relative flex flex-col items-center justify-center w-full px-4">
        {/* Outer circle */}
        <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 border-2 sm:border-3 md:border-4 border-slate-300 rounded-full flex items-center justify-center">
          {/* Inner animated lines */}
          <div className="flex items-center justify-center gap-0.5 sm:gap-1">
            {volumeLevels.map((volume, i) => (
              <div
                key={i}
                className={`w-0.5 sm:w-1 rounded-full transition-all duration-75 ${
                  userVolume > 0.3
                    ? "bg-green-500" // Green when user is speaking
                    : isActive
                      ? "bg-blue-500" // Blue when agent is speaking
                      : "bg-slate-300" // Gray when neither is speaking
                }`}
                style={{
                  height: `${Math.max(12, 12 + volume * 24)}px`, // Responsive: min 12px, up to 36px based on volume
                  opacity:
                    userVolume > 0.3 || isActive ? 0.7 + volume * 0.3 : 0.5, // Opacity based on volume
                }}
              />
            ))}
          </div>
        </div>

        {/* User volume indicator - removed */}

        {/* Status text */}
        <div className="text-center mt-2 sm:mt-3 md:mt-4">
          <p className="text-sm sm:text-base md:text-lg font-semibold text-slate-700 leading-tight">
            {userVolume > 0.3
              ? "Usuario Hablando"
              : isActive
                ? "Agente Hablando"
                : "Usuario Hablando"}
          </p>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-tight">
            Habla con el micrófono para interactuar
          </p>
        </div>
      </div>
    );
  };

  // Prevent page scroll during mode changes only
  useEffect(() => {
    if (mode === "chat" || mode === "voice") {
      // Store current scroll position
      const currentScrollY = window.scrollY;
      
      // Brief lock to prevent initial jump
      const preventInitialScroll = () => {
        window.scrollTo(0, currentScrollY);
      };
      
      // Prevent scroll for a very brief moment
      preventInitialScroll();
      setTimeout(preventInitialScroll, 0);
      setTimeout(preventInitialScroll, 50);
    }
  }, [mode]);

  // Auto-scroll chat messages to bottom (internal scroll only)
  useEffect(() => {
    if (mode === "chat" && messagesContainerRef.current) {
      // Scroll the messages container to bottom, not the page
      const container = messagesContainerRef.current;
      
      // Use requestAnimationFrame for smoother scrolling
      requestAnimationFrame(() => {
        container.scrollTop = container.scrollHeight;
      });
    }
  }, [messages, isTyping, mode]); // Also trigger on typing changes

  // Monitor speaking status
  useEffect(() => {
    const checkSpeakingStatus = () => {
      if (conversation.isSpeaking !== isSpeaking) {
        setIsSpeaking(conversation.isSpeaking);
      }
    };

    const interval = setInterval(checkSpeakingStatus, 100);

    return () => clearInterval(interval);
  }, [conversation.isSpeaking, isSpeaking]);

  const startVoiceCall = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });

      // Start the conversation session for voice
      await conversation.startSession({
        agentId: agentId,
        connectionType: "webrtc",
        userId: `user_${Date.now()}`,
      });

      setMode("voice");

      // Start with empty messages - agent will provide its own welcome
      setMessages([]);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to start voice call",
      );
      console.error("Error starting voice call:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const startChat = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Create a direct WebSocket connection for text chat
      const wsUrl = `wss://api.elevenlabs.io/v1/convai/conversation?agent_id=${agentId}`;
      const ws = new WebSocket(wsUrl);

              ws.onopen = () => {
        console.log("Chat WebSocket connected");
        setIsConnected(true);
        setMode("chat");

        // Send initial conversation data (minimal configuration)
        ws.send(
          JSON.stringify({
            type: "conversation_initiation_client_data",
          }),
        );

        // Start with empty messages - agent will provide its own welcome
        setMessages([]);
        
        // Ensure chat container scrolls to bottom when entering chat mode
        setTimeout(() => {
          if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
          }
        }, 100);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          console.log("Chat WebSocket message:", data);

          // Handle ping messages to keep connection alive
          if (data.type === "ping") {
            ws.send(
              JSON.stringify({
                type: "pong",
                event_id: data.ping_event.event_id,
              }),
            );

            return;
          }

          if (data.type === "agent_response") {
            // Hide typing animation when agent responds
            setIsTyping(false);
            // Clear typing timeout
            if (typingTimeoutRef.current) {
              clearTimeout(typingTimeoutRef.current);
              typingTimeoutRef.current = null;
            }
            setMessages((prev) => [
              ...prev,
              {
                type: "agent",
                text: data.agent_response_event.agent_response,
                timestamp: new Date(),
              },
            ]);
          } else if (data.type === "user_transcript") {
            setMessages((prev) => [
              ...prev,
              {
                type: "user",
                text: data.user_transcription_event.user_transcript,
                timestamp: new Date(),
              },
            ]);
          } else if (data.type === "conversation_initiation_metadata") {
            console.log("Conversation initiated successfully");
          }
        } catch (parseError) {
          console.error("Error parsing WebSocket message:", parseError);
        }
      };

      ws.onerror = (error) => {
        console.error("Chat WebSocket error:", error);
        setError("Error connecting to chat");
      };

      ws.onclose = (event) => {
        console.log("Chat WebSocket disconnected:", event.code, event.reason);
        setIsConnected(false);
        setMode("idle");
      };

      chatWebSocketRef.current = ws;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start chat");
      console.error("Error starting chat:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const stopConversation = async () => {
    try {
      if (mode === "voice") {
        await conversation.endSession();
      } else if (mode === "chat" && chatWebSocketRef.current) {
        chatWebSocketRef.current.close();
      }

      setIsConnected(false);
      setMode("idle");
      setMessages([]);
    } catch (err) {
      console.error("Error stopping conversation:", err);
    }
  };

  const sendTextMessage = async () => {
    if (!inputText.trim() || !isConnected || mode !== "chat") return;

    try {
      const messageText = inputText.trim();

      // Add user message to chat immediately
      setMessages((prev) => [
        ...prev,
        {
          type: "user",
          text: messageText,
          timestamp: new Date(),
        },
      ]);

      // Clear input
      setInputText("");

      // Show typing animation
      setIsTyping(true);

      // Set timeout to hide typing animation if no response
      const typingTimeout = setTimeout(() => {
        setIsTyping(false);
      }, 30000); // 30 seconds timeout

      // Store timeout reference
      typingTimeoutRef.current = typingTimeout;

      // Send text message through WebSocket
      if (
        chatWebSocketRef.current &&
        chatWebSocketRef.current.readyState === WebSocket.OPEN
      ) {
        // Try different message formats for ElevenLabs WebSocket API
        const messageFormats = [
          {
            type: "user_message",
            text: messageText,
            timestamp: Date.now(),
          },
          {
            type: "text_message",
            content: messageText,
          },
          {
            type: "chat_message",
            message: messageText,
          },
        ];

        // Send the first format
        chatWebSocketRef.current.send(JSON.stringify(messageFormats[0]));
        console.log("Text message sent via WebSocket:", messageText);

        // If no response after 5 seconds, try alternative format
        setTimeout(() => {
          if (
            chatWebSocketRef.current &&
            chatWebSocketRef.current.readyState === WebSocket.OPEN
          ) {
            chatWebSocketRef.current.send(JSON.stringify(messageFormats[1]));
            console.log("Trying alternative message format");
          }
        }, 5000);
      } else {
        console.error("WebSocket not ready for sending message");
        setError("Conexión perdida. Por favor, reconecta el chat.");
        setIsTyping(false);
      }
    } catch (err) {
      setError("Failed to send message");
      console.error("Error sending message:", err);
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendTextMessage();
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-white rounded-lg shadow-lg overflow-hidden min-h-0">
      {/* Header */}
      <div className="bg-slate-500 text-white p-2 sm:p-3 md:p-4 flex-shrink-0">
        <h3 className="text-sm sm:text-base md:text-lg font-semibold leading-tight">
          {title}
        </h3>
        <div className="flex items-center gap-1 sm:gap-2 mt-1 sm:mt-2">
          <div
            className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${isConnected ? "bg-green-400" : "bg-red-400"}`}
          />
          <span className="text-xs sm:text-sm leading-tight">
            {isConnected
              ? `Conectado (${mode === "voice" ? "Voz" : "Chat"})`
              : "Desconectado"}
          </span>
          {isSpeaking && mode === "voice" && (
            <div className="flex items-center gap-1 ml-1 sm:ml-2">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-yellow-400 rounded-full animate-pulse" />
              <span className="text-xs">Hablando...</span>
            </div>
          )}
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 overflow-hidden relative min-h-0">
        {mode === "voice" ? (
          // Voice mode: Show sound meter - perfectly centered in the entire component
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ transform: "translateY(-4px)" }}
          >
            <div className="flex flex-col items-center justify-center w-full h-full">
              <SoundMeter isActive={isSpeaking} />
            </div>
          </div>
        ) : mode === "chat" ? (
          // Chat mode: Show message history with proper scroll container
          <div 
            ref={messagesContainerRef}
            className="flex-1 overflow-y-auto overflow-x-hidden p-2 sm:p-3 md:p-4 space-y-2 sm:space-y-3 md:space-y-4 min-h-0 max-h-full"
            style={{ 
              scrollBehavior: 'smooth',
              overscrollBehavior: 'contain' // Prevent scroll chaining to parent
            }}
          >
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] sm:max-w-[80%] p-2 sm:p-3 rounded-lg ${
                    message.type === "user"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  <p className="text-xs sm:text-sm leading-relaxed">
                    {message.text}
                  </p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}

            {/* Typing Animation */}
            {isTyping && mode === "chat" && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-800 p-2 sm:p-3 rounded-lg">
                  <div className="flex items-center gap-1">
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-full animate-bounce" />
                      <div
                        className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      />
                      <div
                        className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 ml-1 sm:ml-2">
                      El agente está escribiendo...
                    </span>
                  </div>
                </div>
              </div>
            )}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-800 p-2 sm:p-3 rounded-lg">
                  <p className="text-xs sm:text-sm">Conectando...</p>
                </div>
              </div>
            )}

            {error && (
              <div className="flex justify-center">
                <div className="bg-red-100 text-red-800 p-2 sm:p-3 rounded-lg">
                  <p className="text-xs sm:text-sm text-center">{error}</p>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        ) : (
          // Idle mode: Show welcome - absolutely centered
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="text-center">
              <h3 className="text-base sm:text-lg md:text-xl font-semibold text-slate-700 mb-2 leading-tight">
                Bienvenido al Asistente Virtual
              </h3>
              <p className="text-xs sm:text-sm md:text-base text-slate-500">
                Selecciona una opción para comenzar
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Control Area */}
      <div className="p-2 sm:p-3 md:p-4 border-t border-gray-200 flex-shrink-0">
        {mode === "idle" ? (
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              className="flex-1 bg-lime-500 text-white py-2 sm:py-3 px-3 sm:px-4 rounded-lg hover:bg-lime-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-xs sm:text-sm font-medium"
              disabled={isLoading}
              onClick={startVoiceCall}
            >
              {isLoading ? "Conectando..." : "📞 Iniciar Llamada"}
            </button>
            <button
              className="flex-1 bg-slate-500 text-white py-2 sm:py-3 px-3 sm:px-4 rounded-lg hover:bg-slate-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-xs sm:text-sm font-medium"
              disabled={isLoading}
              onClick={startChat}
            >
              {isLoading ? "Conectando..." : "💬 Iniciar Chat"}
            </button>
          </div>
        ) : mode === "voice" ? (
          <div className="text-center">
            <p className="text-xs sm:text-sm text-gray-600 mb-2 leading-tight">
              🎤 Habla por micrófono para comunicarte con el agente
            </p>
            <div className="flex justify-center">
              <button
                className="bg-red-600 text-white w-12 h-12 sm:w-14 sm:h-14 rounded-full hover:bg-red-700 flex items-center justify-center transition-colors"
                onClick={stopConversation}
                title="Finalizar llamada"
              >
                <IoCall className="w-5 h-5 sm:w-6 sm:h-6 rotate-[135deg]" />
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                className="flex-1 border border-gray-300 rounded-lg px-2 sm:px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm min-w-0"
                placeholder="Escribe tu mensaje..."
                style={{ fontSize: "16px" }} // Prevent zoom on iOS
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              <button
                className="bg-slate-500 text-white w-10 h-10 sm:w-12 sm:h-12 rounded-full hover:bg-slate-600 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center flex-shrink-0 transition-colors"
                disabled={!inputText.trim()}
                onClick={sendTextMessage}
                title="Enviar mensaje"
              >
                <IoSend className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
            <div className="flex justify-center">
              <button
                className="bg-red-600 text-white w-12 h-12 sm:w-14 sm:h-14 rounded-full hover:bg-red-700 flex items-center justify-center transition-colors"
                onClick={stopConversation}
                title="Finalizar chat"
              >
                <IoCall className="w-5 h-5 sm:w-6 sm:h-6 rotate-[135deg]" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
