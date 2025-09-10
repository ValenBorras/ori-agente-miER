"use client";

import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Send, Mic, Square } from "lucide-react";

type Message = {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  audioUrl?: string;
  localOnly?: boolean;
  durationMs?: number;
};

interface ChatProps {
  title: string;
  promptId: string;
  vectorStoreId: string;
  initialMessages?: Array<{ role: "user" | "assistant"; content: string }>;
}

export default function Chat({ title, promptId, vectorStoreId, initialMessages = [] }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>(
    initialMessages.map((m) => ({ ...m, timestamp: new Date() }))
  );
  const [input, setInput] = useState<string>("");
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [isConnected] = useState<boolean>(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordStartTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      requestAnimationFrame(() => {
        container.scrollTop = container.scrollHeight;
      });
    }
  }, [messages, isTyping]);

  const sendTextMessage = async (text: string, options?: { suppressUserBubble?: boolean }) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const userMessage: Message = {
      role: "user",
      content: trimmed,
      timestamp: new Date(),
    };

    if (!options?.suppressUserBubble) {
      setMessages([...messages, userMessage]);
    }
    setInput("");
    setIsTyping(true);

    try {
      const messagesForSend = [...messages.filter((m) => !m.localOnly), userMessage].map(({ role, content }) => ({ role, content }));
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: messagesForSend,
          promptId,
          vectorStoreId,
        }),
      });

      if (!res.ok) throw new Error("Error en la API");

      const data: { reply: string } = await res.json();

      const assistantMessage: Message = {
        role: "assistant",
        content: data.reply,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error("Error al enviar mensaje:", err);
    } finally {
      setIsTyping(false);
    }
  };

  const sendMessage = async () => {
    await sendTextMessage(input);
  };

  const startRecording = async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        alert("Tu navegador no soporta grabación de audio.");
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        try {
          const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
          const audioUrl = URL.createObjectURL(audioBlob);
          const durationMs = recordStartTimeRef.current ? Date.now() - recordStartTimeRef.current : undefined;

          // Agregar burbuja de audio local (solo UI)
          setMessages((prev) => [
            ...prev,
            {
              role: "user",
              content: "",
              timestamp: new Date(),
              audioUrl,
              localOnly: true,
              durationMs,
            },
          ]);
          const formData = new FormData();
          formData.append("file", audioBlob, "recording.webm");

          const res = await fetch("/api/transcribe", {
            method: "POST",
            body: formData,
          });

          if (!res.ok) {
            console.error("Error en transcripción", await res.text());
            return;
          }

          const data = (await res.json()) as { text?: string };
          if (data?.text) {
            await sendTextMessage(data.text, { suppressUserBubble: true });
          }
        } catch (error) {
          console.error("Error procesando audio:", error);
        } finally {
          // Liberar el micrófono
          try {
            mediaStreamRef.current?.getTracks().forEach((t) => t.stop());
          } catch {}
          mediaStreamRef.current = null;
        }
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      recordStartTimeRef.current = Date.now();
    } catch (error) {
      console.error("No se pudo iniciar la grabación:", error);
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    try {
      mediaRecorderRef.current?.stop();
    } catch (error) {
      console.error("No se pudo detener la grabación:", error);
    } finally {
      setIsRecording(false);
      recordStartTimeRef.current = null;
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-white rounded-lg shadow-lg overflow-hidden min-h-0">
      <div className="bg-slate-500 text-white p-2 sm:p-3 md:p-4 flex-shrink-0">
        <h3 className="text-sm sm:text-base md:text-lg font-semibold leading-tight">
          {title}
        </h3>
        <div className="flex items-center gap-1 sm:gap-2 mt-1 sm:mt-2">
          <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${isConnected ? "bg-green-400" : "bg-red-400"}`} />
          <span className="text-xs sm:text-sm leading-tight">
            {isConnected ? "Conectado (Chat)" : "Desconectado"}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-hidden relative min-h-0">
        <div 
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto overflow-x-hidden p-2 sm:p-3 md:p-4 space-y-2 sm:space-y-3 md:space-y-4 min-h-0 max-h-full"
          style={{ scrollBehavior: "smooth", overscrollBehavior: "contain" }}
        >
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] sm:max-w-[80%] p-2 sm:p-3 rounded-lg ${
                  m.role === "user" ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-800"
                }`}
              >
                {m.role === "assistant" ? (
                  <div className="text-xs sm:text-sm leading-snug">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        p: ({ node, ...props }) => (
                          <p className="m-0 mb-1 leading-snug" {...props} />
                        ),
                        ul: ({ node, ...props }) => (
                          <ul className="list-disc pl-4 my-1 leading-snug" {...props} />
                        ),
                        ol: ({ node, ...props }) => (
                          <ol className="list-decimal pl-4 my-1 leading-snug" {...props} />
                        ),
                        li: ({ node, ...props }) => (
                          <li className="my-0.5 leading-snug" {...props} />
                        ),
                        h1: ({ node, ...props }) => (
                          <h1 className="text-sm font-semibold m-0 mb-1" {...props} />
                        ),
                        h2: ({ node, ...props }) => (
                          <h2 className="text-sm font-semibold m-0 mb-1" {...props} />
                        ),
                        h3: ({ node, ...props }) => (
                          <h3 className="text-sm font-semibold m-0 mb-1" {...props} />
                        ),
                        blockquote: ({ node, ...props }) => (
                          <blockquote className="m-0 my-1 pl-2 border-l-2 border-gray-300" {...props} />
                        ),
                        pre: ({ node, ...props }) => (
                          <pre className="m-0 my-1 p-2 bg-gray-200 rounded text-[11px] sm:text-xs leading-snug overflow-auto" {...props} />
                        ),
                        code: ({ node, inline, className, children, ...props }: any) => (
                          <code
                            className={`${className ?? ""} ${inline ? "px-1 py-0.5 rounded bg-gray-200" : ""}`}
                            {...props}
                          >
                            {children}
                          </code>
                        ),
                      }}
                    >
                      {m.content}
                    </ReactMarkdown>
                  </div>
                ) : m.audioUrl ? (
                  <div className="flex items-center gap-3">
                    <audio src={m.audioUrl} controls className="w-40 sm:w-56" />
                    {typeof m.durationMs === "number" && (
                      <span className="text-[10px] sm:text-xs opacity-80">{Math.round(m.durationMs / 1000)}s</span>
                    )}
                  </div>
                ) : (
                  <p className="text-xs sm:text-sm leading-relaxed">{m.content}</p>
                )}
                <p className="text-xs opacity-70 mt-1">{m.timestamp.toLocaleTimeString()}</p>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-gray-100 text-gray-800 p-2 sm:p-3 rounded-lg">
                <div className="flex items-center gap-1">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-full animate-bounce" />
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                  </div>
                  <span className="text-xs text-gray-500 ml-1 sm:ml-2">El agente está escribiendo...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="p-2 sm:p-3 md:p-4 border-t border-gray-200 flex-shrink-0">
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              className={`flex-1 border border-gray-300 rounded-lg px-2 sm:px-3 py-2 focus:outline-none text-xs sm:text-sm min-w-0 ${
                isRecording ? "ring-2 ring-red-500 animate-pulse" : "focus:ring-2 focus:ring-blue-500"
              }`}
              placeholder={isRecording ? "Grabando... toca detener para enviar" : "Escribe tu mensaje..."}
              style={{ fontSize: "16px" }}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => handleKeyPress(e)}
            />
            <button
              onClick={() => {
                if (isRecording) stopRecording();
                else startRecording();
              }}
              className={`${
                isRecording
                  ? "bg-red-500 hover:bg-red-600"
                  : "bg-gray-200 hover:bg-gray-300 text-gray-800"
              } w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-colors`}
              title={isRecording ? "Detener grabación" : "Grabar audio"}
            >
              {isRecording ? (
                <Square className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              ) : (
                <Mic className="w-4 h-4 sm:w-5 sm:h-5" />
              )}
            </button>
            <button
              className="bg-slate-500 text-white w-10 h-10 sm:w-12 sm:h-12 rounded-full hover:bg-slate-600 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center flex-shrink-0 transition-colors"
              disabled={!input.trim()}
              title="Enviar mensaje"
              onClick={sendMessage}
            >
              <Send className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}