import React from "react";

import { MicIcon } from "./Icons";
import { Button } from "./Button";

interface PermissionPromptProps {
  onRequestPermission: () => Promise<boolean>;
  error: string | null;
  isSupported: boolean;
  className?: string;
}

export function PermissionPrompt({
  onRequestPermission,
  error,
  isSupported,
  className = "",
}: PermissionPromptProps) {
  const [isRequesting, setIsRequesting] = React.useState(false);

  const handleRequestPermission = async () => {
    setIsRequesting(true);
    try {
      await onRequestPermission();
    } finally {
      setIsRequesting(false);
    }
  };

  if (!isSupported) {
    return (
      <div
        className={`flex flex-col items-center gap-4 p-6 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800 ${className}`}
      >
        <div className="flex items-center gap-2 text-yellow-700 dark:text-yellow-300">
          <MicIcon size={20} />
          <span className="font-medium">Browser Not Supported</span>
        </div>
        <p className="text-sm text-yellow-600 dark:text-yellow-400 text-center">
          Your browser doesn't support the Web Audio API required for microphone
          access. Please use a modern browser like Chrome, Firefox, Safari, or
          Edge.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`flex flex-col items-center gap-4 p-6 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 ${className}`}
      >
        <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
          <MicIcon size={20} />
          <span className="font-medium">Microphone Access Required</span>
        </div>
        <p className="text-sm text-red-600 dark:text-red-400 text-center">
          {error.includes("permission denied")
            ? "Microphone access was denied. Please allow microphone access in your browser settings to use voice chat."
            : error}
        </p>
        <div className="text-xs text-red-500 dark:text-red-400 text-center space-y-1">
          <p>
            <strong>How to enable microphone:</strong>
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>Click the microphone icon in your browser's address bar</li>
            <li>Select "Allow" when prompted</li>
            <li>Refresh the page and try again</li>
          </ul>
        </div>
        <Button
          className="bg-red-600 hover:bg-red-700 text-white"
          disabled={isRequesting}
          onClick={handleRequestPermission}
        >
          {isRequesting ? "Requesting..." : "Try Again"}
        </Button>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col items-center gap-4 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 ${className}`}
    >
      <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
        <MicIcon size={20} />
        <span className="font-medium">Enable Microphone</span>
      </div>
      <p className="text-sm text-blue-600 dark:text-blue-400 text-center">
        To use voice chat with the avatar, we need access to your microphone.
        This allows the avatar to hear and respond to your voice.
      </p>
      <Button
        className="bg-blue-600 hover:bg-blue-700 text-white"
        disabled={isRequesting}
        onClick={handleRequestPermission}
      >
        {isRequesting ? "Requesting Permission..." : "Enable Microphone"}
      </Button>
      <p className="text-xs text-blue-500 dark:text-blue-400 text-center">
        Your microphone will only be used for this conversation and won't be
        recorded or stored.
      </p>
    </div>
  );
}
