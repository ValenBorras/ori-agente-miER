"use client";

import MinimalistAvatarWrapper from "@/components/MinimalistAvatar";

export default function App() {
  return (
    <div
      className="w-full min-h-screen flex flex-col items-center justify-center bg-cover bg-center bg-no-repeat p-4 sm:p-0 overflow-hidden"
      style={{
        backgroundImage: "url(/gobER-expandida.webp)",
      }}
    >
      <div className="w-full max-w-md flex flex-col items-center justify-center">
        <MinimalistAvatarWrapper />
      </div>
    </div>
  );
}
