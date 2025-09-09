"use client";

import ElevenLabsChat from "@/components/ElevenLabsChat";
import Chat from "./components/Chat";

export default function App() {
  return (
    <>
      {/* <elevenlabs-convai agent-id="agent_6501k48f25taeztas78wnx0rpgxr"></elevenlabs-convai><script src="https://unpkg.com/@elevenlabs/convai-widget-embed" async type="text/javascript"></script> */}

      {/* Container principal - Flex column en móvil, Flex row en desktop */}
      <div className="flex flex-col lg:flex-row w-full min-h-screen">
        {/* Chat para Docentes */}
        <section
          className="w-full lg:w-1/2 flex items-center justify-center p-3 sm:p-6 md:p-8"
          style={{ minHeight: "calc(100vh - 120px)" }}
        >
          <div
            className="w-full max-w-4xl px-4 sm:px-6 md:px-8 pb-2"
            style={{ height: "calc(100vh - 255px)" }}
          >
            <Chat
  title="Ori Docentes"
  promptId="pmpt_68c08415be248196bbac0c2d47fd275f0b113e42284663e1"
  vectorStoreId="vs_68c07fd04c348191ab3e91538baf73ef"
  initialMessages={[
  { role: "assistant", content: "¡Hola! ¿En qué puedo ayudarte?" }
]}
/>
          </div>
        </section>

        {/* Chat para Padres */}
        <section
          className="w-full lg:w-1/2 flex items-center justify-center p-3 sm:p-6 md:p-8"
          style={{ minHeight: "calc(100vh - 120px)" }}
        >
          <div
            className="w-full max-w-4xl px-4 sm:px-6 md:px-8"
            style={{ height: "calc(100vh - 255px)" }}
          >
            <Chat
  title="Ori Padres"
  promptId="pmpt_68c08415be248196bbac0c2d47fd275f0b113e42284663e1"
  vectorStoreId="vs_68c07fd04c348191ab3e91538baf73ef"
  initialMessages={[
  { role: "assistant", content: "¡Hola! ¿En qué puedo ayudarte?" }
]}
/>
          </div>
        </section>
      </div>
    </>
  );
}
