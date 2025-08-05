import React from 'react';
import { Script } from '@/types/script';
import { useScriptPlayer } from './logic/useScriptPlayer';
import { Button } from './Button';
import { PlayIcon, PauseIcon, StopIcon } from './Icons';

interface ScriptPlayerProps {
  script: Script;
}

export const ScriptPlayer: React.FC<ScriptPlayerProps> = ({ script }) => {
  const {
    playerState,
    currentMessage,
    isCompleted,
    startScript,
    pauseScript,
    resumeScript,
    stopScript,
    skipToMessage,
    progress,
  } = useScriptPlayer(script);

  const handlePlayPause = () => {
    if (!playerState.isPlaying) {
      startScript();
    } else if (playerState.isPaused) {
      resumeScript();
    } else {
      pauseScript();
    }
  };

  const handleStop = () => {
    stopScript();
  };

  const handleSkipToMessage = (index: number) => {
    skipToMessage(index);
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">{script.title}</h2>
        <div className="flex items-center gap-2">
          <Button
            onClick={handlePlayPause}
            disabled={!playerState.isPlaying && !playerState.isPaused && isCompleted}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300"
          >
            {!playerState.isPlaying ? (
              <>
                <PlayIcon className="w-4 h-4" />
                Play
              </>
            ) : playerState.isPaused ? (
              <>
                <PlayIcon className="w-4 h-4" />
                Resume
              </>
            ) : (
              <>
                <PauseIcon className="w-4 h-4" />
                Pause
              </>
            )}
          </Button>
          <Button
            onClick={handleStop}
            disabled={!playerState.isPlaying && !playerState.isPaused}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:bg-gray-300"
          >
            <StopIcon className="w-4 h-4" />
            Stop
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Progress: {progress}%</span>
          <span>
            {playerState.currentMessageIndex + 1} / {script.messages.length}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Current Message Display */}
      {currentMessage && (
        <div className="mb-6 p-4 rounded-lg border-2 border-blue-200 bg-blue-50">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-bold text-blue-800">
              {currentMessage.speaker}:
            </span>
            {currentMessage.speaker === 'Rogelio' && (
              <span className="text-sm text-blue-600">
                (Wait {currentMessage.estimatedDuration || 6}s)
              </span>
            )}
          </div>
          <p className="text-gray-800 text-lg leading-relaxed">
            {currentMessage.content}
          </p>
        </div>
      )}

      {/* Script Messages List */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {script.messages.map((message, index) => (
          <div
            key={message.id}
            className={`p-3 rounded-lg border cursor-pointer transition-all ${
              index === playerState.currentMessageIndex
                ? 'border-blue-500 bg-blue-50'
                : index < playerState.currentMessageIndex
                ? 'border-green-300 bg-green-50'
                : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
            }`}
            onClick={() => handleSkipToMessage(index)}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-sm text-gray-700">
                {message.speaker}
              </span>
              {message.speaker === 'Rogelio' && message.estimatedDuration && (
                <span className="text-xs text-gray-500">
                  {message.estimatedDuration}s
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600 line-clamp-2">
              {message.content}
            </p>
          </div>
        ))}
      </div>

      {/* Status */}
      {isCompleted && (
        <div className="mt-4 p-4 bg-green-100 border border-green-300 rounded-lg">
          <p className="text-green-800 font-semibold">
            ✅ Script completed successfully!
          </p>
        </div>
      )}
    </div>
  );
}; 