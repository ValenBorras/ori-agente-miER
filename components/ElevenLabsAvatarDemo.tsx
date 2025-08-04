/**
 * ElevenLabsAvatarDemo Component
 *
 * This is a demo page showing the new ElevenLabs + HeyGen architecture
 * for testing and development purposes.
 */

"use client";

import React from "react";

import MinimalistElevenLabsAvatar from "./MinimalistElevenLabsAvatar";

export default function ElevenLabsAvatarDemo() {
  return (
    <div className="w-full min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            ElevenLabs + HeyGen Integration Demo
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Experience the new architecture where ElevenLabs Conversational AI
            handles all conversation logic while HeyGen Avatar provides the
            visual presentation. Speak naturally to the AI assistant!
          </p>
        </div>

        {/* Architecture Description */}
        <div className="grid md:grid-cols-3 gap-6 mb-8 text-sm">
          <div className="bg-blue-900 bg-opacity-50 p-4 rounded-lg">
            <h3 className="text-blue-300 font-semibold mb-2">
              🎙️ ElevenLabs (Brain)
            </h3>
            <ul className="text-blue-100 space-y-1">
              <li>• Speech recognition</li>
              <li>• Conversation logic</li>
              <li>• AI responses</li>
              <li>• Knowledge base</li>
            </ul>
          </div>

          <div className="bg-purple-900 bg-opacity-50 p-4 rounded-lg">
            <h3 className="text-purple-300 font-semibold mb-2">🔄 Bridge</h3>
            <ul className="text-purple-100 space-y-1">
              <li>• Audio streaming</li>
              <li>• Message routing</li>
              <li>• State management</li>
              <li>• Error handling</li>
            </ul>
          </div>

          <div className="bg-green-900 bg-opacity-50 p-4 rounded-lg">
            <h3 className="text-green-300 font-semibold mb-2">
              🎭 HeyGen (Face)
            </h3>
            <ul className="text-green-100 space-y-1">
              <li>• Visual presentation</li>
              <li>• Lip-sync animation</li>
              <li>• Avatar rendering</li>
              <li>• Puppet mode only</li>
            </ul>
          </div>
        </div>

        {/* Avatar Component */}
        <div className="flex justify-center">
          <div className="w-full max-w-md">
            <MinimalistElevenLabsAvatar />
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 text-center">
          <div className="bg-gray-800 p-4 rounded-lg max-w-2xl mx-auto">
            <h3 className="text-white font-semibold mb-2">How to Use:</h3>
            <ol className="text-gray-300 text-sm space-y-1 text-left">
              <li>1. Click "Comenzar Conversación" to start</li>
              <li>2. Allow microphone access when prompted</li>
              <li>3. Speak naturally to the avatar</li>
              <li>4. ElevenLabs processes your speech and responds</li>
              <li>5. HeyGen avatar displays the AI response visually</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
