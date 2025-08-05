import React from "react";

import { MicIcon, MicOffIcon } from "./Icons";

interface MuteButtonProps {
  isMuted: boolean;
  onToggle: () => void;
  disabled?: boolean;
  size?: "small" | "medium" | "large";
  showLabel?: boolean;
  className?: string;
}

export function MuteButton({
  isMuted,
  onToggle,
  disabled = false,
  size = "medium",
  showLabel = false,
  className = "",
}: MuteButtonProps) {
  const sizeClasses = {
    small: "w-8 h-8",
    medium: "w-12 h-12",
    large: "w-16 h-16",
  };

  const iconSizes = {
    small: 16,
    medium: 20,
    large: 24,
  };

  const buttonClasses = `
    relative flex items-center justify-center rounded-full
    transition-all duration-200 ease-out
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    ${sizeClasses[size]}
    ${className}
  `;

  const getButtonStyle = () => {
    if (disabled) {
      return "bg-gray-300 text-gray-500 hover:bg-gray-300 focus:ring-gray-400";
    }

    if (isMuted) {
      return "bg-red-500 text-white hover:bg-red-600 focus:ring-red-400 active:bg-red-700";
    }

    return "bg-green-500 text-white hover:bg-green-600 focus:ring-green-400 active:bg-green-700";
  };

  const handleClick = () => {
    if (!disabled) {
      onToggle();
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleClick();
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        aria-label={isMuted ? "Unmute microphone" : "Mute microphone"}
        aria-pressed={isMuted}
        className={`${buttonClasses} ${getButtonStyle()}`}
        disabled={disabled}
        title={`${isMuted ? "Unmute" : "Mute"} microphone (M)`}
        type="button"
        onClick={handleClick}
        onKeyDown={handleKeyDown}
      >
        {/* Icon */}
        <div className="relative">
          {isMuted ? (
            <MicOffIcon size={iconSizes[size]} />
          ) : (
            <MicIcon size={iconSizes[size]} />
          )}
        </div>

        {/* Ripple effect on click */}
        <div className="absolute inset-0 rounded-full bg-white opacity-0 transition-opacity duration-200 pointer-events-none" />
      </button>

      {/* Optional label */}
      {showLabel && (
        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
          {isMuted ? "Muted" : "Active"}
        </span>
      )}

      {/* Keyboard shortcut hint */}
      <span className="text-xs text-gray-400 dark:text-gray-500">
        Press M to {isMuted ? "unmute" : "mute"}
      </span>
    </div>
  );
}
