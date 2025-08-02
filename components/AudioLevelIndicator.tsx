import React from 'react';

interface AudioLevelIndicatorProps {
  audioLevel: number; // 0-100
  isListening: boolean;
  isMuted: boolean;
  variant?: 'bars' | 'circle' | 'pulse';
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export function AudioLevelIndicator({
  audioLevel,
  isListening,
  isMuted,
  variant = 'bars',
  size = 'medium',
  className = ''
}: AudioLevelIndicatorProps) {
  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-12 h-12',
    large: 'w-16 h-16'
  };

  const barCount = 5;
  const bars = Array.from({ length: barCount }, (_, i) => {
    const barHeight = Math.max(0.1, (audioLevel / 100) * (i + 1) / barCount);
    const opacity = isMuted ? 0.3 : isListening ? 1 : 0.5;
    
    return (
      <div
        key={i}
        className="bg-current transition-all duration-75 ease-out rounded-sm"
        style={{
          height: `${barHeight * 100}%`,
          opacity,
          transform: `scaleY(${isListening ? 1 : 0.8})`
        }}
      />
    );
  });

  const getColorClass = () => {
    if (isMuted) return 'text-gray-400';
    if (!isListening) return 'text-gray-500';
    
    if (audioLevel > 70) return 'text-red-400';
    if (audioLevel > 40) return 'text-yellow-400';
    return 'text-green-400';
  };

  if (variant === 'circle') {
    const radius = 20;
    const circumference = 2 * Math.PI * radius;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (audioLevel / 100) * circumference;
    
    return (
      <div className={`relative ${sizeClasses[size]} ${className}`}>
        <svg
          className="w-full h-full transform -rotate-90"
          viewBox="0 0 50 50"
        >
          {/* Background circle */}
          <circle
            cx="25"
            cy="25"
            r={radius}
            stroke="currentColor"
            strokeWidth="3"
            fill="none"
            className="text-gray-300 opacity-30"
          />
          {/* Progress circle */}
          <circle
            cx="25"
            cy="25"
            r={radius}
            stroke="currentColor"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
            className={`transition-all duration-150 ease-out ${getColorClass()}`}
            style={{
              strokeDasharray,
              strokeDashoffset: isMuted ? circumference : strokeDashoffset,
              opacity: isListening ? 1 : 0.6
            }}
          />
        </svg>
        {/* Center dot */}
        <div 
          className={`absolute inset-0 flex items-center justify-center transition-all duration-150 ${
            isListening && audioLevel > 10 ? 'scale-110' : 'scale-100'
          }`}
        >
          <div 
            className={`w-2 h-2 rounded-full transition-all duration-150 ${
              isMuted ? 'bg-gray-400' : 'bg-current'
            } ${getColorClass()}`}
            style={{
              opacity: isListening ? 1 : 0.6,
              transform: `scale(${1 + (audioLevel / 100) * 0.5})`
            }}
          />
        </div>
      </div>
    );
  }

  if (variant === 'pulse') {
    return (
      <div className={`relative ${sizeClasses[size]} ${className}`}>
        <div 
          className={`w-full h-full rounded-full transition-all duration-150 ease-out ${
            isMuted ? 'bg-gray-400' : 'bg-current'
          } ${getColorClass()}`}
          style={{
            opacity: isListening ? 0.8 : 0.4,
            transform: `scale(${1 + (audioLevel / 100) * 0.3})`,
            animation: isListening && audioLevel > 10 ? 'pulse 1s ease-in-out infinite' : 'none'
          }}
        />
        {/* Inner pulse ring */}
        {isListening && audioLevel > 20 && (
          <div 
            className="absolute inset-0 rounded-full border-2 border-current animate-ping"
            style={{
              opacity: 0.3,
              animationDelay: '0.5s'
            }}
          />
        )}
      </div>
    );
  }

  // Default bars variant
  return (
    <div className={`flex items-end justify-center gap-1 ${sizeClasses[size]} ${className}`}>
      {bars}
    </div>
  );
} 