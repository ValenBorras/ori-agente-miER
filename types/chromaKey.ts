export interface ChromaKeyOptions {
  whiteThreshold: number; // 0.85 - Minimum brightness to consider "white" (0-1)
  saturationThreshold: number; // 0.1 - Maximum saturation for white pixels (0-1)
  tolerance: number; // 0.05 - Tolerance for color variations from pure white
  smoothing: number; // 0.1 - Edge smoothing factor
}

export interface ChromaKeyAvatarProps {
  sessionState: any;
  stream: MediaStream | null;
  onStreamReady?: (stream: MediaStream) => void;
  onStreamDisconnected?: () => void;
  className?: string;
}

export interface ChromaKeyProcessorState {
  isProcessing: boolean;
  error: string | null;
  frameRate: number;
}
