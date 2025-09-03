"use client";

import { useState, useEffect, useRef } from 'react';
import { useConversation } from '@elevenlabs/react';

interface ElevenLabsChatProps {
  agentId: string;
  title: string;
}

type Mode = 'idle' | 'voice' | 'chat';

export default function ElevenLabsChat({ agentId, title }: ElevenLabsChatProps) {
  const [messages, setMessages] = useState<Array<{ type: 'user' | 'agent', text: string, timestamp: Date }>>([]);
  const [inputText, setInputText] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [mode, setMode] = useState<Mode>('idle');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatWebSocketRef = useRef<WebSocket | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const conversation = useConversation({
    onConnect: () => {
      setIsConnected(true);
      setError(null);
      console.log('Connected to ElevenLabs conversation');
    },
    onDisconnect: () => {
      setIsConnected(false);
      setMode('idle');
      setIsSpeaking(false); // Reset speaking status
      console.log('Disconnected from ElevenLabs conversation');
    },
    onMessage: (message: any) => {
      console.log('Received message:', message);
      
      // Handle different message types from the conversation
      if (message.source === 'user') {
        // User message (from voice or text) - only show in chat mode
        if (mode === 'chat') {
          setMessages(prev => [...prev, {
            type: 'user',
            text: typeof message === 'string' ? message : message.message || '',
            timestamp: new Date()
          }]);
        }
      } else if (message.source === 'ai') {
        // AI agent response - only show in chat mode
        if (mode === 'chat') {
          setMessages(prev => [...prev, {
            type: 'agent',
            text: typeof message === 'string' ? message : message.message || '',
            timestamp: new Date()
          }]);
        }
        // Update speaking status for voice mode
        setIsSpeaking(true);
      }
    },
    onError: (error: any) => {
      setError(error.message || 'An error occurred');
      console.error('ElevenLabs conversation error:', error);
    }
  });

  // Sound meter component for voice mode
  const SoundMeter = ({ isActive }: { isActive: boolean }) => {
    const [volumeLevels, setVolumeLevels] = useState<number[]>([0, 0, 0, 0, 0, 0, 0, 0]);
    
    useEffect(() => {
      if (!isActive) {
        setVolumeLevels([0, 0, 0, 0, 0, 0, 0, 0]);
        return;
      }
      
      const interval = setInterval(() => {
        // Generate realistic volume levels based on a sine wave pattern
        const time = Date.now() * 0.003; // Speed of animation
        setVolumeLevels(prev => prev.map((_, index) => {
          const offset = index * 0.5; // Stagger the bars
          const wave = Math.sin(time + offset) * 0.5 + 0.5; // Normalize to 0-1
          const noise = Math.random() * 0.3; // Add some randomness
          return Math.min(1, Math.max(0, wave + noise));
        }));
      }, 50); // Update 20 times per second for smooth animation
      
      return () => clearInterval(interval);
    }, [isActive]);
    
    return (
      <div className="relative flex flex-col items-center justify-center w-full">
        {/* Outer circle */}
        <div className="w-32 h-32 border-4 border-slate-300 rounded-full flex items-center justify-center">
          {/* Inner animated lines */}
          <div className="flex items-center justify-center gap-1">
            {volumeLevels.map((volume, i) => (
              <div
                key={i}
                className={`w-1 rounded-full transition-all duration-75 ${
                  isActive 
                    ? 'bg-blue-500' 
                    : 'bg-slate-300'
                }`}
                style={{
                  height: `${20 + (volume * 40)}px`, // 20px to 60px based on volume
                  opacity: isActive ? 0.7 + (volume * 0.3) : 0.5, // Opacity based on volume
                }}
              />
            ))}
          </div>
        </div>
        
        {/* Status text */}
        <div className="text-center mt-4">
          <p className="text-lg font-semibold text-slate-700">
            {isActive ? 'Agente Hablando' : 'Esperando...'}
          </p>
          <p className="text-sm text-slate-500 mt-1">
            Habla con el micrófono para interactuar
          </p>
        </div>
      </div>
    );
  };
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
        connectionType: 'webrtc',
        userId: `user_${Date.now()}`,
      });
      
      setMode('voice');
      
      // Start with empty messages - agent will provide its own welcome
      setMessages([]);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start voice call');
      console.error('Error starting voice call:', err);
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
        console.log('Chat WebSocket connected');
        setIsConnected(true);
        setMode('chat');
        
        // Send initial conversation data (minimal configuration)
        ws.send(JSON.stringify({
          type: "conversation_initiation_client_data"
        }));
        
        // Start with empty messages - agent will provide its own welcome
        setMessages([]);
      };
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('Chat WebSocket message:', data);
          
          // Handle ping messages to keep connection alive
          if (data.type === 'ping') {
            ws.send(JSON.stringify({
              type: "pong",
              event_id: data.ping_event.event_id
            }));
            return;
          }
          
          if (data.type === 'agent_response') {
            // Hide typing animation when agent responds
            setIsTyping(false);
            // Clear typing timeout
            if (typingTimeoutRef.current) {
              clearTimeout(typingTimeoutRef.current);
              typingTimeoutRef.current = null;
            }
            setMessages(prev => [...prev, {
              type: 'agent',
              text: data.agent_response_event.agent_response,
              timestamp: new Date()
            }]);
          } else if (data.type === 'user_transcript') {
            setMessages(prev => [...prev, {
              type: 'user',
              text: data.user_transcription_event.user_transcript,
              timestamp: new Date()
            }]);
          } else if (data.type === 'conversation_initiation_metadata') {
            console.log('Conversation initiated successfully');
          }
        } catch (parseError) {
          console.error('Error parsing WebSocket message:', parseError);
        }
      };
      
      ws.onerror = (error) => {
        console.error('Chat WebSocket error:', error);
        setError('Error connecting to chat');
      };
      
      ws.onclose = (event) => {
        console.log('Chat WebSocket disconnected:', event.code, event.reason);
        setIsConnected(false);
        setMode('idle');
      };
      
      chatWebSocketRef.current = ws;
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start chat');
      console.error('Error starting chat:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const stopConversation = async () => {
    try {
      if (mode === 'voice') {
        await conversation.endSession();
      } else if (mode === 'chat' && chatWebSocketRef.current) {
        chatWebSocketRef.current.close();
      }
      
      setIsConnected(false);
      setMode('idle');
      setMessages([]);
    } catch (err) {
      console.error('Error stopping conversation:', err);
    }
  };

  const sendTextMessage = async () => {
    if (!inputText.trim() || !isConnected || mode !== 'chat') return;
    
    try {
      const messageText = inputText.trim();
      
      // Add user message to chat immediately
      setMessages(prev => [...prev, {
        type: 'user',
        text: messageText,
        timestamp: new Date()
      }]);
      
      // Clear input
      setInputText('');
      
      // Show typing animation
      setIsTyping(true);
      
      // Set timeout to hide typing animation if no response
      const typingTimeout = setTimeout(() => {
        setIsTyping(false);
      }, 30000); // 30 seconds timeout
      
      // Store timeout reference
      typingTimeoutRef.current = typingTimeout;
      
      // Send text message through WebSocket
      if (chatWebSocketRef.current && chatWebSocketRef.current.readyState === WebSocket.OPEN) {
        // Try different message formats for ElevenLabs WebSocket API
        const messageFormats = [
          {
            type: "user_message",
            text: messageText,
            timestamp: Date.now()
          },
          {
            type: "text_message",
            content: messageText
          },
          {
            type: "chat_message",
            message: messageText
          }
        ];
        
        // Send the first format
        chatWebSocketRef.current.send(JSON.stringify(messageFormats[0]));
        console.log('Text message sent via WebSocket:', messageText);
        
        // If no response after 5 seconds, try alternative format
        setTimeout(() => {
          if (chatWebSocketRef.current && chatWebSocketRef.current.readyState === WebSocket.OPEN) {
            chatWebSocketRef.current.send(JSON.stringify(messageFormats[1]));
            console.log('Trying alternative message format');
          }
        }, 5000);
        
      } else {
        console.error('WebSocket not ready for sending message');
        setError('Conexión perdida. Por favor, reconecta el chat.');
        setIsTyping(false);
      }
      
    } catch (err) {
      setError('Failed to send message');
      console.error('Error sending message:', err);
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendTextMessage();
    }
  };

    return (
    <div className="w-full h-full flex flex-col bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-slate-500 text-white p-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        <div className="flex items-center gap-2 mt-2">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
          <span className="text-sm">
            {isConnected ? `Conectado (${mode === 'voice' ? 'Voz' : 'Chat'})` : 'Desconectado'}
          </span>
          {isSpeaking && mode === 'voice' && (
            <div className="flex items-center gap-1 ml-2">
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
              <span className="text-xs">Hablando...</span>
            </div>
          )}
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 overflow-hidden relative">
        {mode === 'voice' ? (
          // Voice mode: Show sound meter - perfectly centered in the entire component
          <div className="absolute inset-0 flex items-center justify-center" style={{ transform: 'translateY(-8px)' }}>
            <div className="flex flex-col items-center justify-center w-full h-full">
              <SoundMeter isActive={isSpeaking} />
            </div>
          </div>
        ) : mode === 'chat' ? (
          // Chat mode: Show message history
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.type === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            
            {/* Typing Animation */}
            {isTyping && mode === 'chat' && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-800 p-3 rounded-lg">
                  <div className="flex items-center gap-1">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-xs text-gray-500 ml-2">El agente está escribiendo...</span>
                  </div>
                </div>
              </div>
            )}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-800 p-3 rounded-lg">
                  <p className="text-sm">Conectando...</p>
                </div>
              </div>
            )}
            
            {error && (
              <div className="flex justify-center">
                <div className="bg-red-100 text-red-800 p-3 rounded-lg">
                  <p className="text-sm">{error}</p>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        ) : (
          // Idle mode: Show welcome - absolutely centered
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-slate-700 mb-2">
                Bienvenido al Asistente Virtual
              </h3>
              <p className="text-slate-500">
                Selecciona una opción para comenzar
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Control Area */}
      <div className="p-4 border-t border-gray-200">
        {mode === 'idle' ? (
          <div className="flex gap-2">
            <button
              onClick={startVoiceCall}
              disabled={isLoading}
              className="flex-1 bg-lime-500 text-white py-3 px-4 rounded-lg hover:bg-lime-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Conectando...' : '📞 Iniciar Llamada'}
            </button>
            <button
              onClick={startChat}
              disabled={isLoading}
              className="flex-1 bg-slate-500 text-white py-3 px-4 rounded-lg hover:bg-slate-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Conectando...' : '💬 Iniciar Chat'}
            </button>
          </div>
        ) : mode === 'voice' ? (
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">
              🎤 Habla por micrófono para comunicarte con el agente
            </p>
            <button
              onClick={stopConversation}
              className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700"
            >
              Finalizar Llamada
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Escribe tu mensaje..."
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={sendTextMessage}
                disabled={!inputText.trim()}
                className="bg-slate-500 text-white px-4 py-2 rounded-lg hover:bg-slate-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
              > 
                Enviar
              </button>
            </div>
            <button
              onClick={stopConversation}
              className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700"
            >
              Finalizar Chat
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
