/**
 * ElevenLabs Conversational AI WebSocket Service
 *
 * This service handles the primary conversation logic using ElevenLabs Conversational AI.
 * It manages WebSocket connections, audio streaming, and conversation responses.
 *
 * Architecture: User → ElevenLabs (brain) → Text Response → HeyGen Avatar (puppet)
 */

export interface ElevenLabsWebSocketEvent {
  type: string;
  [key: string]: any;
}

export interface UserTranscriptEvent extends ElevenLabsWebSocketEvent {
  type: "user_transcript";
  user_transcription_event: {
    user_transcript: string;
  };
}

export interface AgentResponseEvent extends ElevenLabsWebSocketEvent {
  type: "agent_response";
  agent_response_event: {
    agent_response: string;
  };
}

export interface AudioResponseEvent extends ElevenLabsWebSocketEvent {
  type: "audio";
  audio_event: {
    audio_base_64: string;
    event_id: number;
  };
}

export interface InterruptionEvent extends ElevenLabsWebSocketEvent {
  type: "interruption";
  interruption_event: {
    reason: string;
  };
}

export interface PingEvent extends ElevenLabsWebSocketEvent {
  type: "ping";
  ping_event: {
    event_id: number;
    ping_ms?: number;
  };
}

export type ConversationEventHandler = (
  event: ElevenLabsWebSocketEvent,
) => void;

export interface ConversationHandlers {
  onUserTranscript?: (transcript: string) => void;
  onAgentResponse?: (response: string) => void;
  onAudioResponse?: (audioBase64: string, eventId: number) => void;
  onInterruption?: (reason: string) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
  onUserSpeaking?: (isSpeaking: boolean) => void;
}

export class ElevenLabsConversationService {
  private websocket: WebSocket | null = null;
  private agentId: string;
  private apiKey: string;
  private mediaStream: MediaStream | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private isRecording = false;
  private handlers: ConversationHandlers = {};
  private keepAliveInterval: NodeJS.Timeout | null = null;

  constructor(agentId: string, apiKey: string) {
    this.agentId = agentId;
    this.apiKey = apiKey;
  }

  /**
   * Register event handlers for conversation events
   */
  setHandlers(handlers: ConversationHandlers) {
    this.handlers = handlers;
  }

  /**
   * Start the conversation by connecting to ElevenLabs WebSocket
   */
  async startConversation(): Promise<void> {
    try {
      // Get microphone access
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      // Connect to ElevenLabs WebSocket
      const websocketUrl = `wss://api.elevenlabs.io/v1/convai/conversation?agent_id=${this.agentId}`;

      this.websocket = new WebSocket(websocketUrl);

      this.websocket.onopen = () => {
        // Send initial conversation setup
        this.sendMessage({
          type: "conversation_initiation_client_data",
        });

        this.startAudioStreaming();
        this.handlers.onConnect?.();

        // Start keep-alive to prevent automatic disconnection
        this.startKeepAlive();
      };

      this.websocket.onmessage = (event) => {
        this.handleWebSocketMessage(event);
      };

      this.websocket.onclose = () => {
        this.cleanup();
        this.handlers.onDisconnect?.();
      };

      this.websocket.onerror = (_error) => {
        this.handlers.onError?.(new Error("WebSocket connection failed"));
      };
    } catch (error) {
      console.error("❌ Error starting ElevenLabs conversation:", error);
      this.handlers.onError?.(error as Error);
      throw error;
    }
  }

  /**
   * Stop the conversation and cleanup resources
   */
  async stopConversation(): Promise<void> {
    if (this.websocket) {
      this.websocket.close();
    }

    this.cleanup();
  }

  /**
   * Start keep-alive to prevent automatic disconnection
   */
  private startKeepAlive(): void {
    // Send periodic activity to keep connection alive
    this.keepAliveInterval = setInterval(() => {
      if (this.websocket?.readyState === WebSocket.OPEN) {
        this.sendMessage({
          type: "user_activity",
        });
      }
    }, 60000); // Every 60 seconds - less frequent to reduce overhead
  }

  /**
   * Send a text message to the ElevenLabs agent
   */
  sendTextMessage(text: string): void {
    if (!this.websocket || this.websocket.readyState !== WebSocket.OPEN) {
      console.warn("⚠️ WebSocket not connected, cannot send text message");

      return;
    }

    this.sendMessage({
      type: "user_message",
      text: text,
    });
  }

  /**
   * Send contextual updates to influence the conversation
   */
  sendContextualUpdate(context: string): void {
    if (!this.websocket || this.websocket.readyState !== WebSocket.OPEN) {
      console.warn("⚠️ WebSocket not connected, cannot send contextual update");

      return;
    }

    this.sendMessage({
      type: "contextual_update",
      text: context,
    });
  }

  /**
   * Handle incoming WebSocket messages from ElevenLabs
   */
  private handleWebSocketMessage(event: MessageEvent) {
    try {
      const data = JSON.parse(event.data) as ElevenLabsWebSocketEvent;

      console.log("🎙️ ElevenLabs message:", data.type, data);

      switch (data.type) {
        case "ping":
          this.handlePing(data as PingEvent);
          break;

        case "vad_score":
          // Voice Activity Detection - user is speaking
          const vadEvent = data as any;

          if (vadEvent.vad_score_event?.vad_score > 0.5) {
            this.handlers.onUserSpeaking?.(true);
          }
          break;

        case "user_transcript":
          const userEvent = data as UserTranscriptEvent;

          console.log(
            `⏱️ [${new Date().toISOString()}] ELEVENLABS_USER_TRANSCRIPT: "${userEvent.user_transcription_event.user_transcript}"`,
          );
          this.handlers.onUserTranscript?.(
            userEvent.user_transcription_event.user_transcript,
          );
          this.handlers.onUserSpeaking?.(false); // User stopped speaking
          break;

        case "agent_response":
          const responseEvent = data as AgentResponseEvent;

          console.log(
            `⏱️ [${new Date().toISOString()}] ELEVENLABS_AGENT_RESPONSE: "${responseEvent.agent_response_event.agent_response}"`,
          );
          // This is the key part - forward agent response to HeyGen puppet
          this.handlers.onAgentResponse?.(
            responseEvent.agent_response_event.agent_response,
          );
          break;

        case "audio":
          const audioEvent = data as AudioResponseEvent;

          // We ignore ElevenLabs audio output since HeyGen handles the visual presentation
          this.handlers.onAudioResponse?.(
            audioEvent.audio_event.audio_base_64,
            audioEvent.audio_event.event_id,
          );
          break;

        case "interruption":
          const interruptEvent = data as InterruptionEvent;

          this.handlers.onInterruption?.(
            interruptEvent.interruption_event.reason,
          );
          break;

        default:
          // Unhandled message type
          break;
      }
    } catch (error) {
      console.error("❌ Error parsing ElevenLabs WebSocket message:", error);
    }
  }

  /**
   * Handle ping messages to keep connection alive
   */
  private handlePing(pingEvent: PingEvent) {
    const delay = pingEvent.ping_event.ping_ms || 0;

    setTimeout(() => {
      this.sendMessage({
        type: "pong",
        event_id: pingEvent.ping_event.event_id,
      });
    }, delay);
  }

  /**
   * Start streaming audio to ElevenLabs for speech recognition
   */
  private startAudioStreaming() {
    if (!this.mediaStream) return;

    try {
      // Create audio context for PCM conversion with smaller buffer for lower latency
      const audioContext = new AudioContext({ sampleRate: 16000 });
      const source = audioContext.createMediaStreamSource(this.mediaStream);
      const processor = audioContext.createScriptProcessor(2048, 1, 1); // Smaller buffer for lower latency

      processor.onaudioprocess = (event) => {
        if (this.websocket?.readyState === WebSocket.OPEN) {
          const inputData = event.inputBuffer.getChannelData(0);

          // Convert float32 to int16 PCM
          const pcmData = new Int16Array(inputData.length);

          for (let i = 0; i < inputData.length; i++) {
            pcmData[i] = Math.max(
              -32768,
              Math.min(32767, inputData[i] * 32768),
            );
          }

          // Convert to base64
          const uint8Array = new Uint8Array(pcmData.buffer);
          const base64Data = btoa(
            Array.from(uint8Array, (byte) => String.fromCharCode(byte)).join(
              "",
            ),
          );

          this.sendMessage({
            user_audio_chunk: base64Data,
          });
        }
      };

      source.connect(processor);
      processor.connect(audioContext.destination);

      this.isRecording = true;
    } catch (error) {
      console.error("❌ Error starting audio streaming:", error);

      // Fallback to MediaRecorder if ScriptProcessor fails
      try {
        this.mediaRecorder = new MediaRecorder(this.mediaStream, {
          mimeType: "audio/webm;codecs=opus",
        });

        this.mediaRecorder.ondataavailable = (event) => {
          if (
            event.data.size > 0 &&
            this.websocket?.readyState === WebSocket.OPEN
          ) {
            // Convert audio blob to base64 for ElevenLabs
            const reader = new FileReader();

            reader.onload = () => {
              const base64Data = (reader.result as string).split(",")[1];

              this.sendMessage({
                user_audio_chunk: base64Data,
              });
            };
            reader.readAsDataURL(event.data);
          }
        };

        // Start recording in smaller chunks for lower latency
        this.mediaRecorder.start(50); // 50ms chunks for lower latency
        this.isRecording = true;
      } catch (fallbackError) {
        console.error(
          "❌ Fallback audio streaming also failed:",
          fallbackError,
        );
      }
    }
  }

  /**
   * Send a message to the ElevenLabs WebSocket
   */
  private sendMessage(message: any) {
    if (!this.websocket || this.websocket.readyState !== WebSocket.OPEN) {
      return;
    }

    this.websocket.send(JSON.stringify(message));
  }

  /**
   * Clean up resources
   */
  private cleanup() {
    if (this.keepAliveInterval) {
      clearInterval(this.keepAliveInterval);
      this.keepAliveInterval = null;
    }

    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop();
      this.isRecording = false;
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }

    this.mediaRecorder = null;
    this.websocket = null;
  }

  /**
   * Check if the conversation is active
   */
  isActive(): boolean {
    return this.websocket?.readyState === WebSocket.OPEN;
  }
}

/**
 * Utility function to create and configure ElevenLabs conversation service
 */
export function createElevenLabsConversation(
  agentId: string,
  apiKey: string,
  handlers: ConversationHandlers,
): ElevenLabsConversationService {
  const service = new ElevenLabsConversationService(agentId, apiKey);

  service.setHandlers(handlers);

  return service;
}
