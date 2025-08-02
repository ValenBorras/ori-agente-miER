"use client";

import React, { useState } from 'react';
import { MicrophoneNoiseMonitor } from './MicrophoneNoiseMonitor';

export function MicrophoneNoiseMonitorDemo() {
  const [currentVariant, setCurrentVariant] = useState<'bars' | 'circle' | 'pulse'>('bars');
  const [currentSize, setCurrentSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [sensitivity, setSensitivity] = useState(5);
  const [audioLevel, setAudioLevel] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  const handleMuteToggle = (muted: boolean) => {
    setIsMuted(muted);
    console.log('Microphone muted:', muted);
  };

  const handleAudioLevel = (level: number) => {
    setAudioLevel(level);
    console.log('Audio level:', level);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Microphone Noise Monitor Demo
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Real-time microphone audio level detection with visual feedback
        </p>
      </div>

      {/* Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          Configuration
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Variant Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Visualization Style
            </label>
            <div className="space-y-2">
              {(['bars', 'circle', 'pulse'] as const).map((variant) => (
                <label key={variant} className="flex items-center">
                  <input
                    type="radio"
                    name="variant"
                    value={variant}
                    checked={currentVariant === variant}
                    onChange={(e) => setCurrentVariant(e.target.value as typeof currentVariant)}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                    {variant}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Size Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Size
            </label>
            <div className="space-y-2">
              {(['small', 'medium', 'large'] as const).map((size) => (
                <label key={size} className="flex items-center">
                  <input
                    type="radio"
                    name="size"
                    value={size}
                    checked={currentSize === size}
                    onChange={(e) => setCurrentSize(e.target.value as typeof currentSize)}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                    {size}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Sensitivity Control */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Sensitivity: {sensitivity}
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={sensitivity}
              onChange={(e) => setSensitivity(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Low</span>
              <span>High</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Demo */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-lg">
        <div className="flex flex-col items-center space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Live Microphone Monitor
          </h2>
          
          <MicrophoneNoiseMonitor
            variant={currentVariant}
            size={currentSize}
            sensitivity={sensitivity}
            onMuteToggle={handleMuteToggle}
            onAudioLevel={handleAudioLevel}
            autoStart={false}
            className="w-full max-w-sm"
          />

          {/* Status Display */}
          <div className="text-center space-y-2">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Current Audio Level: <span className="font-mono">{audioLevel.toFixed(1)}%</span>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Status: <span className={isMuted ? 'text-red-500' : 'text-green-500'}>
                {isMuted ? 'Muted' : 'Active'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h3 className="font-medium text-gray-900 dark:text-white">Real-time Audio Processing</h3>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Web Audio API integration</li>
              <li>• 60fps smooth animations</li>
              <li>• Configurable sensitivity</li>
              <li>• Noise suppression</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h3 className="font-medium text-gray-900 dark:text-white">User Experience</h3>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Keyboard shortcuts (M to mute)</li>
              <li>• Permission handling</li>
              <li>• Multiple visualization styles</li>
              <li>• Responsive design</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Usage Instructions */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
        <h2 className="text-xl font-semibold mb-4 text-blue-900 dark:text-blue-100">
          How to Use
        </h2>
        <div className="space-y-3 text-sm text-blue-800 dark:text-blue-200">
          <p>1. <strong>Enable Microphone:</strong> Click the "Enable Microphone" button and allow access when prompted</p>
          <p>2. <strong>Start Listening:</strong> Click "Start Listening" to begin audio monitoring</p>
          <p>3. <strong>Visual Feedback:</strong> The indicator will show your audio level in real-time</p>
          <p>4. <strong>Mute/Unmute:</strong> Use the mute button or press 'M' key to toggle microphone</p>
          <p>5. <strong>Customize:</strong> Adjust sensitivity and visualization style using the controls above</p>
        </div>
      </div>
    </div>
  );
} 