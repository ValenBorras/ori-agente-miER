import { useState, useCallback, useMemo } from 'react';
import { ChromaKeyOptions } from '../../types/chromaKey';
import { DEFAULT_CHROMA_OPTIONS } from '../utils/chromaKey';

export interface UseChromaKeyReturn {
  chromaOptions: ChromaKeyOptions;
  isChromaEnabled: boolean;
  updateOption: (key: keyof ChromaKeyOptions, value: number) => void;
  updateOptions: (options: Partial<ChromaKeyOptions>) => void;
  toggleChroma: () => void;
  resetToDefaults: () => void;
  setChromaEnabled: (enabled: boolean) => void;
}

/**
 * Custom hook for managing chroma key state and options
 */
export function useChromaKey(
  initialOptions: Partial<ChromaKeyOptions> = {},
  initialEnabled = false
): UseChromaKeyReturn {
  const [chromaOptions, setChromaOptions] = useState<ChromaKeyOptions>({
    ...DEFAULT_CHROMA_OPTIONS,
    ...initialOptions,
  });
  
  const [isChromaEnabled, setIsChromaEnabled] = useState(initialEnabled);
  
  const updateOption = useCallback((key: keyof ChromaKeyOptions, value: number) => {
    setChromaOptions(prev => ({
      ...prev,
      [key]: value,
    }));
  }, []);
  
  const updateOptions = useCallback((options: Partial<ChromaKeyOptions>) => {
    setChromaOptions(prev => ({
      ...prev,
      ...options,
    }));
  }, []);
  
  const toggleChroma = useCallback(() => {
    setIsChromaEnabled(prev => !prev);
  }, []);
  
  const resetToDefaults = useCallback(() => {
    setChromaOptions(DEFAULT_CHROMA_OPTIONS);
  }, []);
  
  const setChromaEnabled = useCallback((enabled: boolean) => {
    setIsChromaEnabled(enabled);
  }, []);
  
  return useMemo(() => ({
    chromaOptions,
    isChromaEnabled,
    updateOption,
    updateOptions,
    toggleChroma,
    resetToDefaults,
    setChromaEnabled,
  }), [
    chromaOptions,
    isChromaEnabled,
    updateOption,
    updateOptions,
    toggleChroma,
    resetToDefaults,
    setChromaEnabled,
  ]);
}