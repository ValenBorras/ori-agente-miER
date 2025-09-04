"use client";

import ElevenLabsChat from "@/components/ElevenLabsChat";

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
            <ElevenLabsChat
              agentId="agent_6501k48f25taeztas78wnx0rpgxr"
              title="Asistente para Docentes"
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
            <ElevenLabsChat
              agentId="agent_6701k48e6gs2fdqte1q1ewwb0gsj"
              title="Asistente para Padres"
            />
          </div>
        </section>
      </div>
    </>
  );
}
