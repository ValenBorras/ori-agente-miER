"use client";

import ElevenLabsChat from "@/components/ElevenLabsChat";

export default function App() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4 sm:p-6">
      {/* <elevenlabs-convai agent-id="agent_6501k48f25taeztas78wnx0rpgxr"></elevenlabs-convai><script src="https://unpkg.com/@elevenlabs/convai-widget-embed" async type="text/javascript"></script> */}
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Chat para Docentes */}
        <div className="flex flex-col items-center">
          <div className="w-full h-[600px] px-10">
            <ElevenLabsChat 
              agentId="agent_6501k48f25taeztas78wnx0rpgxr"
              title="Asistente para Docentes"
            />
          </div>
        </div>

        {/* Chat para Padres */}
        <div className="flex flex-col items-center">
          <div className="w-full h-[600px]  px-10">
            <ElevenLabsChat 
              agentId="agent_6701k48e6gs2fdqte1q1ewwb0gsj"
              title="Asistente para Padres"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
