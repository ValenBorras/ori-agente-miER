'use client';

import React, { useState, useCallback } from 'react';
import { ChromaKeyOptions } from '../types/chromaKey';
import { DEFAULT_CHROMA_OPTIONS } from './utils/chromaKey';

interface ChromaKeyControlsProps {
  options: ChromaKeyOptions;
  onOptionsChange: (options: ChromaKeyOptions) => void;
  className?: string;
}

export function ChromaKeyControls({ 
  options, 
  onOptionsChange, 
  className = '' 
}: ChromaKeyControlsProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const handleOptionChange = useCallback((
    key: keyof ChromaKeyOptions, 
    value: number
  ) => {
    onOptionsChange({
      ...options,
      [key]: value,
    });
  }, [options, onOptionsChange]);
  
  const resetToDefaults = useCallback(() => {
    onOptionsChange(DEFAULT_CHROMA_OPTIONS);
  }, [onOptionsChange]);
  
  return (
    <div className={`bg-black/50 rounded-lg p-3 backdrop-blur-sm ${className}`}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full text-white text-sm font-medium"
      >
        <span>Chroma Key Settings</span>
        <svg
          className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isExpanded && (
        <div className="mt-3 space-y-3">
          {/* White Threshold */}
          <div>
            <label className="block text-white text-xs mb-1">
              White Threshold: {options.whiteThreshold.toFixed(2)}
            </label>
            <input
              type="range"
              min="0.5"
              max="1.0"
              step="0.01"
              value={options.whiteThreshold}
              onChange={(e) => handleOptionChange('whiteThreshold', parseFloat(e.target.value))}
              className="w-full"
            />
            <div className="text-xs text-gray-400">
              Minimum brightness to consider white
            </div>
          </div>
          
          {/* Saturation Threshold */}
          <div>
            <label className="block text-white text-xs mb-1">
              Saturation Threshold: {options.saturationThreshold.toFixed(2)}
            </label>
            <input
              type="range"
              min="0.0"
              max="0.3"
              step="0.01"
              value={options.saturationThreshold}
              onChange={(e) => handleOptionChange('saturationThreshold', parseFloat(e.target.value))}
              className="w-full"
            />
            <div className="text-xs text-gray-400">
              Maximum color saturation for white
            </div>
          </div>
          
          {/* Tolerance */}
          <div>
            <label className="block text-white text-xs mb-1">
              Tolerance: {options.tolerance.toFixed(2)}
            </label>
            <input
              type="range"
              min="0.0"
              max="0.2"
              step="0.01"
              value={options.tolerance}
              onChange={(e) => handleOptionChange('tolerance', parseFloat(e.target.value))}
              className="w-full"
            />
            <div className="text-xs text-gray-400">
              Color variation tolerance
            </div>
          </div>
          
          {/* Smoothing */}
          <div>
            <label className="block text-white text-xs mb-1">
              Edge Smoothing: {options.smoothing.toFixed(2)}
            </label>
            <input
              type="range"
              min="0.0"
              max="0.5"
              step="0.01"
              value={options.smoothing}
              onChange={(e) => handleOptionChange('smoothing', parseFloat(e.target.value))}
              className="w-full"
            />
            <div className="text-xs text-gray-400">
              Edge smoothing strength
            </div>
          </div>
          
          {/* Reset button */}
          <button
            onClick={resetToDefaults}
            className="w-full mt-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors"
          >
            Reset to Defaults
          </button>
        </div>
      )}
    </div>
  );
}