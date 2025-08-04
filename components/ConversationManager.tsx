/**
 * ConversationManager Component
 *
 * This component bridges ElevenLabs Conversational AI with HeyGen Avatar.
 * Architecture: User → ElevenLabs (conversation brain) → HeyGen Avatar (visual puppet)
 *
 * ElevenLabs handles:
 * - Speech recognition (STT)
 * - Conversation logic and AI responses
 * - Knowledge base queries
 * - Context management
 *
 * HeyGen handles:
 * - Visual avatar presentation
 * - Lip-sync and animation
 * - Text-to-speech for visual display
 */

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { TaskType } from "@heygen/streaming-avatar";

import { useStreamingAvatarContext } from "./logic/context";

import {
  ElevenLabsConversationService,
  createElevenLabsConversation,
  ConversationHandlers,
} from "@/lib/elevenLabsConversation";

export interface ConversationManagerProps {
  agentId: string;
  apiKey: string;
  onStatusChange?: (status: ConversationStatus) => void;
  onUserMessage?: (message: string) => void;
  onAgentMessage?: (message: string) => void;
  onError?: (error: Error) => void;
}

export enum ConversationStatus {
  INACTIVE = "inactive",
  CONNECTING = "connecting",
  CONNECTED = "connected",
  LISTENING = "listening",
  PROCESSING = "processing",
  RESPONDING = "responding",
  ERROR = "error",
}

export const useConversationManager = (props: ConversationManagerProps) => {
  const {
  agentId,
  apiKey,
  onStatusChange,
  onUserMessage,
  onAgentMessage,
    onError,
  } = props;
  const { avatarRef } = useStreamingAvatarContext();
  const [status, setStatus] = useState<ConversationStatus>(
    ConversationStatus.INACTIVE,
  );
  const [lastUserMessage, setLastUserMessage] = useState<string>("");
  const [lastAgentMessage, setLastAgentMessage] = useState<string>("");
  const [conversationHistory, setConversationHistory] = useState<
    Array<{
      type: "user" | "agent";
      message: string;
      timestamp: Date;
    }>
  >([]);

  const conversationServiceRef = useRef<ElevenLabsConversationService | null>(
    null,
  );

  /**
   * Update status and notify parent component
   */
  const updateStatus = useCallback(
    (newStatus: ConversationStatus) => {
      console.log(`🔄 Conversation status: ${status} → ${newStatus}`);
      setStatus(newStatus);
      onStatusChange?.(newStatus);
    },
    [status, onStatusChange],
  );

  /**
   * Handle user transcript from ElevenLabs speech recognition
   */
  const handleUserTranscript = useCallback(
    (transcript: string) => {
      console.log("👤 User transcript:", transcript);
      setLastUserMessage(transcript);
      onUserMessage?.(transcript);

      // Add to conversation history
      setConversationHistory((prev) => [
        ...prev,
        {
          type: "user",
          message: transcript,
          timestamp: new Date(),
        },
      ]);

      updateStatus(ConversationStatus.PROCESSING);
    },
    [onUserMessage, updateStatus],
  );

  /**
   * Handle agent response from ElevenLabs and forward to HeyGen puppet
   */
  const handleAgentResponse = useCallback(
    async (response: string) => {
      console.log("🤖 Agent response:", response);
      setLastAgentMessage(response);
      onAgentMessage?.(response);

      // Add to conversation history
      setConversationHistory((prev) => [
        ...prev,
        {
          type: "agent",
          message: response,
          timestamp: new Date(),
        },
      ]);

      updateStatus(ConversationStatus.RESPONDING);

      // Send agent response to HeyGen avatar (puppet mode)
      if (avatarRef.current) {
        try {
          console.log("🎭 Sending response to HeyGen avatar puppet:", response);
          await avatarRef.current.speak({
            text: response,
            task_type: TaskType.REPEAT, // Use REPEAT so avatar just says what ElevenLabs decided
          });

          // Return to listening after avatar finishes speaking
          setTimeout(() => {
            updateStatus(ConversationStatus.LISTENING);
          }, 1000);
        } catch (error) {
          console.error("❌ Error sending response to HeyGen avatar:", error);
          onError?.(error as Error);
          updateStatus(ConversationStatus.ERROR);
        }
      } else {
        console.warn("⚠️ HeyGen avatar not available to display response");
        updateStatus(ConversationStatus.LISTENING);
      }
    },
    [avatarRef, onAgentMessage, onError, updateStatus],
  );

  /**
   * Handle conversation interruption
   */
  const handleInterruption = useCallback(
    (reason: string) => {
      console.log("⚠️ Conversation interrupted:", reason);
      updateStatus(ConversationStatus.LISTENING);
    },
    [updateStatus],
  );

  /**
   * Handle connection events
   */
  const handleConnect = useCallback(() => {
    console.log("✅ ElevenLabs conversation connected");
    updateStatus(ConversationStatus.LISTENING);
  }, [updateStatus]);

  const handleDisconnect = useCallback(() => {
    console.log("📴 ElevenLabs conversation disconnected");
    updateStatus(ConversationStatus.INACTIVE);
  }, [updateStatus]);

  const handleError = useCallback(
    (error: Error) => {
      console.error("❌ ElevenLabs conversation error:", error);
      onError?.(error);
      updateStatus(ConversationStatus.ERROR);
    },
    [onError, updateStatus],
  );

  /**
   * Start the ElevenLabs conversation
   */
  const startConversation = useCallback(async () => {
    if (status !== ConversationStatus.INACTIVE) {
      console.warn("⚠️ Conversation already active or connecting");

      return;
    }

    try {
      updateStatus(ConversationStatus.CONNECTING);

      // Setup conversation handlers
      const handlers: ConversationHandlers = {
        onUserTranscript: handleUserTranscript,
        onAgentResponse: handleAgentResponse,
        onInterruption: handleInterruption,
        onConnect: handleConnect,
        onDisconnect: handleDisconnect,
        onError: handleError,
      };

      // Create and start ElevenLabs conversation service
      conversationServiceRef.current = createElevenLabsConversation(
        agentId,
        apiKey,
        handlers,
      );

      await conversationServiceRef.current.startConversation();
    } catch (error) {
      console.error("❌ Failed to start ElevenLabs conversation:", error);
      onError?.(error as Error);
      updateStatus(ConversationStatus.ERROR);
    }
  }, [
    status,
    agentId,
    apiKey,
    handleUserTranscript,
    handleAgentResponse,
    handleInterruption,
    handleConnect,
    handleDisconnect,
    handleError,
    onError,
    updateStatus,
  ]);

  /**
   * Stop the ElevenLabs conversation
   */
  const stopConversation = useCallback(async () => {
    if (conversationServiceRef.current) {
      try {
        await conversationServiceRef.current.stopConversation();
        conversationServiceRef.current = null;
      } catch (error) {
        console.error("❌ Error stopping conversation:", error);
      }
    }
    updateStatus(ConversationStatus.INACTIVE);
  }, [updateStatus]);

  /**
   * Send a text message to ElevenLabs (for testing or manual input)
   */
  const sendTextMessage = useCallback((text: string) => {
    if (conversationServiceRef.current?.isActive()) {
      conversationServiceRef.current.sendTextMessage(text);
    } else {
      console.warn("⚠️ Cannot send text message - conversation not active");
    }
  }, []);

  /**
   * Send contextual updates to influence the conversation
   */
  const sendContextualUpdate = useCallback((context: string) => {
    if (conversationServiceRef.current?.isActive()) {
      conversationServiceRef.current.sendContextualUpdate(context);
    } else {
      console.warn(
        "⚠️ Cannot send contextual update - conversation not active",
      );
    }
  }, []);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (conversationServiceRef.current) {
        conversationServiceRef.current.stopConversation();
      }
    };
  }, []);

  // Return conversation manager API
  return {
    status,
    lastUserMessage,
    lastAgentMessage,
    conversationHistory,
    startConversation,
    stopConversation,
    sendTextMessage,
    sendContextualUpdate,
    isActive:
      status === ConversationStatus.CONNECTED ||
      status === ConversationStatus.LISTENING,
    isListening: status === ConversationStatus.LISTENING,
    isProcessing: status === ConversationStatus.PROCESSING,
    isResponding: status === ConversationStatus.RESPONDING,
  };
};


