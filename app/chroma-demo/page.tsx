"use client";

import MinimalistAvatarWrapper from "../../components/MinimalistAvatar";

export default function ChromaDemo() {
  return (
    <div className="min-h-full w-full flex flex-col items-center justify-center p-8">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4 drop-shadow-lg">
            HeyGen Avatar with Chroma Key
          </h1>
          <p className="text-xl text-white mb-2 drop-shadow-lg">
            AI Avatar with transparent background using real-time chroma key
            processing
          </p>
          <p className="text-sm text-white/80 drop-shadow-lg">
            The white background is automatically removed in real-time for a
            seamless integration
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Avatar Section */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
            <h2 className="text-2xl font-semibold text-white mb-6 text-center">
              Interactive Avatar
            </h2>
            <MinimalistAvatarWrapper />
          </div>

          {/* Features Section */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-white mb-6 drop-shadow-lg">
              Key Features
            </h2>

            <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
              <h3 className="text-lg font-medium text-white mb-2">
                🎭 Real-time Chroma Key
              </h3>
              <p className="text-white/80 text-sm">
                Automatically detects and removes white background pixels using
                advanced algorithms
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
              <h3 className="text-lg font-medium text-white mb-2">
                ⚡ High Performance
              </h3>
              <p className="text-white/80 text-sm">
                Optimized canvas processing with 60 FPS performance monitoring
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
              <h3 className="text-lg font-medium text-white mb-2">
                🎛️ Adjustable Parameters
              </h3>
              <p className="text-white/80 text-sm">
                Fine-tune white detection, tolerance, and edge smoothing in
                real-time
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
              <h3 className="text-lg font-medium text-white mb-2">
                🔧 Easy Integration
              </h3>
              <p className="text-white/80 text-sm">
                Drop-in replacement for standard video components with full
                TypeScript support
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-white/80 drop-shadow-lg">
            Click "Comenzar Chat" to start the avatar session and see the chroma
            key effect in action. Use the settings button (⚙️) to adjust the
            chroma key parameters.
          </p>
        </div>
      </div>
    </div>
  );
}
