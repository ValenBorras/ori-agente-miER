import { useEffect, useRef, useState, useCallback } from "react";

interface UseMicrophoneOptions {
  sensitivity?: number; // 1-10, default 5
  fftSize?: number; // Default 256
  updateFrequency?: number; // Hz, default 60
}

interface UseMicrophoneReturn {
  isListening: boolean;
  hasPermission: boolean;
  isSupported: boolean;
  audioLevel: number; // 0-100
  error: string | null;
  requestPermission: () => Promise<boolean>;
  startListening: () => Promise<void>;
  stopListening: () => void;
}

export function useMicrophone(
  options: UseMicrophoneOptions = {},
): UseMicrophoneReturn {
  const { sensitivity = 5, fftSize = 256 } = options;

  const [isListening, setIsListening] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);

  // Check browser support
  useEffect(() => {
    const supported = !!(navigator.mediaDevices && window.AudioContext);

    setIsSupported(supported);

    if (!supported) {
      setError("Web Audio API not supported in this browser");
    }
  }, []);

  // Calculate audio level from frequency data
  const calculateAudioLevel = useCallback(
    (dataArray: Uint8Array): number => {
      let sum = 0;

      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
      }
      const average = sum / dataArray.length;

      // Apply sensitivity scaling (1-10 to 0.1-2.0 multiplier)
      const sensitivityMultiplier = (sensitivity / 5) * 0.5 + 0.5;
      const scaledLevel = Math.min(
        100,
        (average / 128) * 100 * sensitivityMultiplier,
      );

      // Smooth the transition
      return Math.max(0, Math.min(100, scaledLevel));
    },
    [sensitivity],
  );

  // Update audio level animation
  const updateAudioLevel = useCallback(() => {
    if (!analyserRef.current || !dataArrayRef.current || !isListening) {
      return;
    }

    analyserRef.current.getByteFrequencyData(dataArrayRef.current);
    const level = calculateAudioLevel(dataArrayRef.current);

    setAudioLevel(level);

    animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
  }, [calculateAudioLevel, isListening]);

  // Request microphone permission
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      setError("Web Audio API not supported");

      return false;
    }

    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      setHasPermission(true);
      mediaStreamRef.current = stream;

      // Stop the stream immediately after getting permission
      stream.getTracks().forEach((track) => track.stop());

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";

      setError(`Microphone permission denied: ${errorMessage}`);
      setHasPermission(false);

      return false;
    }
  }, [isSupported]);

  // Start listening
  const startListening = useCallback(async (): Promise<void> => {
    if (!isSupported) {
      setError("Web Audio API not supported");

      return;
    }

    if (!hasPermission) {
      const granted = await requestPermission();

      if (!granted) return;
    }

    try {
      setError(null);

      // Get microphone stream
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      mediaStreamRef.current = stream;

      // Create audio context and analyser
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();

      analyser.fftSize = fftSize;
      analyser.smoothingTimeConstant = 0.8;

      const source = audioContext.createMediaStreamSource(stream);

      source.connect(analyser);

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount);

      setIsListening(true);

      // Start animation loop
      updateAudioLevel();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";

      setError(`Failed to start microphone: ${errorMessage}`);
      setIsListening(false);
    }
  }, [
    isSupported,
    hasPermission,
    requestPermission,
    fftSize,
    updateAudioLevel,
  ]);

  // Stop listening
  const stopListening = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    analyserRef.current = null;
    dataArrayRef.current = null;

    setIsListening(false);
    setAudioLevel(0);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopListening();
    };
  }, [stopListening]);

  return {
    isListening,
    hasPermission,
    isSupported,
    audioLevel,
    error,
    requestPermission,
    startListening,
    stopListening,
  };
}
