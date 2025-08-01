"use client";

import MinimalistAvatarWrapper from "@/components/MinimalistAvatar";

export default function App() {
  return (
    <div
      className="w-screen h-screen flex flex-col items-center justify-center bg-cover bg-center bg-no-repeat"
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
