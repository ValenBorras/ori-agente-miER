import {
  AvatarQuality,
  StreamingEvents,
  VoiceChatTransport,
  VoiceEmotion,
  StartAvatarRequest,
  STTProvider,
  ElevenLabsModel,
  TaskType,
} from "@heygen/streaming-avatar";
import { useEffect, useRef, useState, useCallback } from "react";
import { useMemoizedFn, useUnmount } from "ahooks";
import { FaMicrophone, FaPhone } from "react-icons/fa";

import { Button } from "./Button";
import { ChromaKeyAvatar } from "./ChromaKeyAvatar";
import { useStreamingAvatarSession } from "./logic/useStreamingAvatarSession";
import { useVoiceChat } from "./logic/useVoiceChat";
import { StreamingAvatarProvider, StreamingAvatarSessionState } from "./logic";
import { LoadingIcon } from "./Icons";

import { ENV_IDS } from "@/app/lib/constants";

// Configuración fija en español con velocidad x1
const FIXED_CONFIG: StartAvatarRequest = {
  quality: AvatarQuality.High,
  avatarName: ENV_IDS.AVATAR_ID,
  knowledgeId: ENV_IDS.KNOWLEDGE_ID,
  voice: {
    voiceId: ENV_IDS.VOICE_ID,
    rate: 1.10, // Velocidad x1 (normal)
    emotion: VoiceEmotion.EXCITED,
    model: ElevenLabsModel.eleven_flash_v2_5,
  },
  language: "es", // Idioma fijo en español
  voiceChatTransport: VoiceChatTransport.WEBSOCKET,
  sttSettings: {
    provider: STTProvider.DEEPGRAM,
  },
};

// Componente simple de sensor de audio
function SimpleAudioSensor({ 
  isConnected, 
  onMuteToggle, 
  onEndCall 
}: { 
  isConnected: boolean; 
  onMuteToggle: (muted: boolean) => void; 
  onEndCall: () => void; 
}) {
  const [isMuted, setIsMuted] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [hasPermission, setHasPermission] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Monitorear niveles de audio
  const monitorAudio = useCallback(() => {
    if (!analyserRef.current || isMuted) {
      setAudioLevel(0);
      animationFrameRef.current = requestAnimationFrame(monitorAudio);
      return;
    }

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);
    
    // Calcular volumen promedio
    const volume = dataArray.reduce((a, b) => a + b) / dataArray.length;
    setAudioLevel(volume);

    animationFrameRef.current = requestAnimationFrame(monitorAudio);
  }, [isMuted]);

  // Inicializar audio context y analizador
  const initAudio = useCallback(async () => {
    try {
      if (!hasPermission) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setHasPermission(true);
        mediaStreamRef.current = stream;
      }

      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }

      if (mediaStreamRef.current && !analyserRef.current) {
        const source = audioContextRef.current.createMediaStreamSource(mediaStreamRef.current);
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 256;
        source.connect(analyserRef.current);
      }

      // Iniciar monitoreo de audio
      monitorAudio();
    } catch (error) {
      console.error("Error initializing audio:", error);
    }
  }, [hasPermission, monitorAudio]);

  // Manejar toggle de mute
  const handleMuteToggle = useMemoizedFn(() => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    onMuteToggle(newMutedState);
    
    if (newMutedState) {
      setAudioLevel(0);
    }
  });

  // Inicializar cuando se conecta
  useEffect(() => {
    if (isConnected) {
      initAudio();
    }
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isConnected, initAudio]);

  // Limpiar al desmontar
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  if (!isConnected) return null;

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3 w-full">
      {/* Sensor de audio */}
      <button
        onClick={handleMuteToggle}
        className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all duration-200 border-2 ${
          isMuted 
            ? 'bg-red-500 border-red-500 hover:bg-red-600' 
            : 'bg-white border-gray-300 hover:border-gray-400'
        }`}
      >
        <div className="flex items-end gap-0.5 h-3 sm:h-4">
          {[1, 2, 3, 4].map((bar) => (
            <div
              key={bar}
              className={`w-0.5 sm:w-1 rounded-full transition-all duration-100 ${
                isMuted 
                  ? 'bg-white' 
                  : audioLevel > bar * 15 
                    ? 'bg-green-500' 
                    : 'bg-gray-400'
              }`}
              style={{
                height: `${bar * 2}px`,
                opacity: isMuted ? 0.8 : audioLevel > bar * 15 ? 1 : 0.4
              }}
            />
          ))}
        </div>
      </button>

      {/* Botón de micrófono */}
      <button
        onClick={handleMuteToggle}
        className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all duration-200 border-2 ${
          isMuted 
            ? 'bg-red-500 border-red-500 hover:bg-red-600' 
            : 'bg-white border-gray-300 hover:border-gray-400'
        }`}
      >
        {FaMicrophone({ 
          className: `w-4 h-4 sm:w-5 sm:h-5 ${
            isMuted ? 'text-white' : 'text-gray-700'
          }`
        })}
      </button>

      {/* Botón de colgar */}
      <button
        onClick={onEndCall}
        className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center transition-all duration-200 border-2 border-red-600"
      >
                {FaPhone({ 
          className: "w-4 h-4 sm:w-5 sm:h-5 text-white rotate-90"
        })}
      </button>
    </div>
  );
}

function MinimalistAvatar() {
  const { initAvatar, startAvatar, stopAvatar, sessionState, stream: _stream } =
    useStreamingAvatarSession();
  const { startVoiceChat } = useVoiceChat();

  const [isLoading, setIsLoading] = useState(false);

  const mediaStream = useRef<HTMLVideoElement>(null);

  async function fetchAccessToken() {
    try {
      const response = await fetch("/api/get-access-token", {
        method: "POST",
      });
      const token = await response.text();
      return token;
    } catch (error) {
      console.error("Error fetching access token:", error);
      throw error;
    }
  }

  const startConversation = useMemoizedFn(async () => {
    try {
      setIsLoading(true);
      console.log("=== INICIANDO SESIÓN DE AVATAR ===");
      
      const newToken = await fetchAccessToken();
      console.log("✅ Token de acceso obtenido");

      const avatar = initAvatar(newToken);

      // Configurar eventos del avatar
      avatar.on(StreamingEvents.AVATAR_START_TALKING, (e) => {
        console.log("Avatar comenzó a hablar", e);
      });
      avatar.on(StreamingEvents.AVATAR_STOP_TALKING, (e) => {
        console.log("Avatar dejó de hablar", e);
      });
      avatar.on(StreamingEvents.STREAM_DISCONNECTED, () => {
        console.log("Stream desconectado");
      });
      avatar.on(StreamingEvents.STREAM_READY, async (event) => {
        console.log("Stream listo:", event.detail);
        
        // Trigger the opening intro using knowledge base
        setTimeout(async () => {
          try {
            console.log("Activando intro del knowledge base...");
            await avatar.speak({
              text: ENV_IDS.INTRODUCTION,
              task_type: TaskType.REPEAT
            });
          } catch (error) {
            console.error("Error activando intro:", error);
            // Fallback: try empty TALK task
            try {
              console.log("Intentando método alternativo con texto vacío...");
              await avatar.speak({
                text: "",
                task_type: TaskType.TALK
              });
            } catch (fallbackError) {
              console.error("Error en método alternativo:", fallbackError);
            }
          }
        }, 1000); // Small delay to ensure stream is fully ready
      });

      // Iniciar avatar con configuración fija
      await startAvatar(FIXED_CONFIG);
      console.log("✅ Avatar iniciado exitosamente");

      // Iniciar chat de voz automáticamente
      console.log("Iniciando chat de voz...");
      await startVoiceChat();

      setIsLoading(false);
    } catch (error) {
      console.error("❌ Error iniciando sesión de avatar:", error);
      setIsLoading(false);
    }
  });

  const stopConversation = useMemoizedFn(async () => {
    try {
      console.log("=== CERRANDO SESIÓN DE AVATAR ===");
      await stopAvatar();
      console.log("✅ Sesión cerrada exitosamente");
    } catch (error) {
      console.error("❌ Error cerrando sesión de avatar:", error);
    }
  });

  const handleMuteToggle = (muted: boolean) => {
    console.log("Microphone muted:", muted);
  };

  useUnmount(() => {
    stopAvatar();
  });

  const handleStreamReady = useMemoizedFn((stream: MediaStream) => {
    console.log("✅ Stream ready for chroma key processing");
  });

  const handleStreamDisconnected = useMemoizedFn(() => {
    console.log("Stream disconnected from chroma key processor");
  });

  return (
    <div className="w-full flex flex-col items-center justify-center gap-4 sm:gap-6 px-4 sm:px-0">
      {/* Contenedor principal con frame y avatar */}
      <div className="relative w-full max-w-sm sm:max-w-md md:max-w-lg aspect-[5/6] flex flex-col items-center justify-center">
        {/* Frame como overlay - posicionado y escalado correctamente */}
        <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center">
          <img
            src="/JUJO_FRAME.webp"
            alt="Avatar Frame"
            className="w-full h-full object-contain"
            style={{
              transform: 'rotate(90deg) scale(1.44)',
            }}
          />
        </div>

        {/* Contenedor del avatar con clipping para que no se salga del frame */}
        <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
          <div className="w-[85%] h-[85%] overflow-hidden rounded-lg">
            {sessionState !== StreamingAvatarSessionState.INACTIVE ? (
              <ChromaKeyAvatar
                ref={mediaStream}
                sessionState={sessionState}
                stream={_stream}
                onStreamReady={handleStreamReady}
                onStreamDisconnected={handleStreamDisconnected}
                className="rounded-lg"
              />
            ) : (
              <div className="w-full h-full  rounded-lg flex items-center justify-center overflow-hidden">
                <img
                  alt="Avatar Preview"
                  className="w-full h-full object-contain"
                  src="/JUJO.png"
                />
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Botones de control */}
      <div className="flex justify-center w-full px-4 sm:px-0">
        {sessionState === StreamingAvatarSessionState.INACTIVE && !isLoading ? (
          <Button
            className="px-6 sm:px-8 py-3 sm:py-3 text-base sm:text-lg font-medium mt-6 sm:mt-4 w-full max-w-xs"
            onClick={startConversation}
          >
            Comenzar Chat
          </Button>
        ) : isLoading ? (
          <div className="flex items-center gap-2 text-white mt-6 sm:mt-4 text-sm sm:text-base">
            <LoadingIcon />
            <span>Conectando...</span>
          </div>
        ) : sessionState === StreamingAvatarSessionState.CONNECTED ? (
          <div className="flex flex-col items-center gap-4 sm:gap-3 mt-6 sm:mt-4 w-full">
            <div className="text-green-400 text-xs sm:text-sm">✓ Conversación activa</div>
            <SimpleAudioSensor
              isConnected={true}
              onMuteToggle={handleMuteToggle}
              onEndCall={stopConversation}
            />
          </div>
        ) : (
          <div className="text-yellow-400 text-xs sm:text-sm mt-6 sm:mt-4">Inicializando...</div>
        )}
      </div>
    </div>
  );
}

export default function MinimalistAvatarWrapper() {
  return (
    <StreamingAvatarProvider basePath={process.env.NEXT_PUBLIC_BASE_API_URL}>
      <MinimalistAvatar />
    </StreamingAvatarProvider>
  );
} 