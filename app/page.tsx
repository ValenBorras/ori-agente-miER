"use client";

import MinimalistElevenLabsAvatar from "@/components/MinimalistElevenLabsAvatar";

export default function App() {
  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center bg-cover bg-center bg-no-repeat p-4 sm:p-0"
      style={{
        backgroundImage: "url(/gobER-expandida.webp)",
      }}
    >
      <div className="w-full max-w-lg flex flex-col items-center justify-center">
        <MinimalistElevenLabsAvatar />
      </div>
    </div>
  );
}
