import {
  AvatarQuality,
  StreamingEvents,
  VoiceChatTransport,
  VoiceEmotion,
  StartAvatarRequest,
  STTProvider,
  ElevenLabsModel,
} from "@heygen/streaming-avatar";
import { useEffect, useRef, useState } from "react";
import { useMemoizedFn, useUnmount } from "ahooks";

import { Button } from "./Button";
import { MinimalistAvatarVideo } from "./MinimalistAvatarVideo";
import { useStreamingAvatarSession } from "./logic/useStreamingAvatarSession";
import { useVoiceChat } from "./logic/useVoiceChat";
import { StreamingAvatarProvider, StreamingAvatarSessionState } from "./logic";
import { LoadingIcon, CloseIcon } from "./Icons";
import { MicrophoneNoiseMonitor } from "./MicrophoneNoiseMonitor";

import { ENV_IDS } from "@/app/lib/constants";

// Configuración fija en español con velocidad x1
const FIXED_CONFIG: StartAvatarRequest = {
  quality: AvatarQuality.High,
  avatarName: ENV_IDS.AVATAR_ID,
  knowledgeId: ENV_IDS.KNOWLEDGE_ID,
  voice: {
    voiceId: ENV_IDS.VOICE_ID,
    rate: 1.0, // Velocidad x1 (normal)
    emotion: VoiceEmotion.FRIENDLY,
    model: ElevenLabsModel.eleven_flash_v2_5,
  },
  language: "es", // Idioma fijo en español
  voiceChatTransport: VoiceChatTransport.WEBSOCKET,
  sttSettings: {
    provider: STTProvider.DEEPGRAM,
  },
};

function MinimalistAvatarWithMicrophone() {
  const { initAvatar, startAvatar, stopAvatar, sessionState, stream } =
    useStreamingAvatarSession();
  const { startVoiceChat } = useVoiceChat();

  const [isLoading, setIsLoading] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

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
      avatar.on(StreamingEvents.STREAM_READY, (event) => {
        console.log("Stream listo:", event.detail);
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
    setIsMuted(muted);
    console.log("Microphone muted:", muted);
  };

  const handleAudioLevel = (level: number) => {
    setAudioLevel(level);
    // You can use this to trigger avatar animations or other effects
    if (level > 30) {
      console.log("User is speaking with level:", level);
    }
  };

  useUnmount(() => {
    stopAvatar();
  });

  useEffect(() => {
    if (stream && mediaStream.current) {
      mediaStream.current.srcObject = stream;
      mediaStream.current.onloadedmetadata = () => {
        mediaStream.current!.play();
      };
    }
  }, [stream]);

  return (
    <div className="w-full flex flex-col items-center justify-center gap-6">
      {/* Contenedor principal con fondo transparente */}
      <div className="relative w-full max-w-md aspect-square overflow-hidden flex flex-col items-center justify-center">
        {sessionState !== StreamingAvatarSessionState.INACTIVE ? (
          <MinimalistAvatarVideo ref={mediaStream} />
        ) : (
          <div className="w-full h-full bg-zinc-900/10 rounded-lg flex items-center justify-center overflow-hidden">
            <img
              alt="Avatar Preview"
              className="w-full h-full object-cover"
              src="/JUJO.png"
            />
          </div>
        )}
      </div>
      
      {/* Microphone Monitor - Only show when connected */}
      {sessionState === StreamingAvatarSessionState.CONNECTED && (
        <div className="w-full max-w-sm">
          <MicrophoneNoiseMonitor
            variant="circle"
            size="medium"
            sensitivity={7}
            onMuteToggle={handleMuteToggle}
            onAudioLevel={handleAudioLevel}
            autoStart={true}
            className="w-full"
          />
          
          {/* Audio Level Display */}
          <div className="text-center mt-2">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Audio Level: <span className="font-mono">{audioLevel.toFixed(1)}%</span>
            </div>
            {audioLevel > 20 && !isMuted && (
              <div className="text-xs text-green-500 animate-pulse">
                Speaking...
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Botones de control */}
      <div className="flex justify-center">
        {sessionState === StreamingAvatarSessionState.INACTIVE && !isLoading ? (
          <Button
            className="px-8 py-3 text-lg font-medium"
            onClick={startConversation}
          >
            Comenzar Chat
          </Button>
        ) : isLoading ? (
          <div className="flex items-center gap-2 text-white">
            <LoadingIcon />
            <span>Conectando...</span>
          </div>
        ) : sessionState === StreamingAvatarSessionState.CONNECTED ? (
          <div className="flex flex-col items-center gap-3">
            <div className="text-green-400 text-sm">✓ Conversación activa</div>
            <Button
              className="px-6 py-2 text-sm bg-red-600 hover:bg-red-700 flex items-center gap-2"
              onClick={stopConversation}
            >
              <CloseIcon size={16} />
              Cerrar Sesión
            </Button>
          </div>
        ) : (
          <div className="text-yellow-400 text-sm">Inicializando...</div>
        )}
      </div>
    </div>
  );
}

export default function MinimalistAvatarWithMicrophoneWrapper() {
  return (
    <StreamingAvatarProvider basePath={process.env.NEXT_PUBLIC_BASE_API_URL}>
      <MinimalistAvatarWithMicrophone />
    </StreamingAvatarProvider>
  );
} 