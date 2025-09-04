"use client";

import ElevenLabsChat from "@/components/ElevenLabsChat";

export default function App() {
  return (
    <>
      {/* <elevenlabs-convai agent-id="agent_6501k48f25taeztas78wnx0rpgxr"></elevenlabs-convai><script src="https://unpkg.com/@elevenlabs/convai-widget-embed" async type="text/javascript"></script> */}

      {/* Chat para Docentes - Ocupa todo el viewport disponible */}
      <section
        className="w-full flex items-center justify-center p-3 sm:p-6 md:p-8"
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

      {/* Chat para Padres - Ocupa todo el viewport disponible */}
      <section
        className="w-full flex items-center justify-center p-3 sm:p-6 md:p-8"
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
    </>
  );
}
