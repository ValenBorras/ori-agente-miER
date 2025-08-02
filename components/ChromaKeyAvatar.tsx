'use client';

import React, { 
  forwardRef, 
  useRef, 
  useEffect, 
  useState, 
  useCallback, 
  useMemo 
} from 'react';
import { ChromaKeyAvatarProps, ChromaKeyProcessorState } from '../types/chromaKey';
import { 
  DEFAULT_CHROMA_OPTIONS, 
  processFrameWithChromaKey, 
  PerformanceMonitor 
} from './utils/chromaKey';

export const ChromaKeyAvatar = forwardRef<HTMLVideoElement, ChromaKeyAvatarProps>(
  ({ 
    sessionState, 
    stream, 
    onStreamReady, 
    onStreamDisconnected, 
    className = '' 
  }, ref) => {
    // Refs
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const sourceCanvasRef = useRef<HTMLCanvasElement>(null);
    const animationFrameRef = useRef<number | null>(null);
    const performanceMonitorRef = useRef(new PerformanceMonitor());
    
    // State - chroma always enabled
    const chromaEnabled = true;
    const [processorState, setProcessorState] = useState<ChromaKeyProcessorState>({
      isProcessing: false,
      error: null,
      frameRate: 0,
    });
    
    // Use default options
    const finalOptions = DEFAULT_CHROMA_OPTIONS;
    
    // Error handler
    const handleError = useCallback((error: Error) => {
      console.error('ChromaKey processing error:', error);
      setProcessorState(prev => ({
        ...prev,
        error: error.message,
        isProcessing: false,
      }));
    }, []);
    
    // Frame processing function
    const processFrame = useCallback(() => {
      if (!chromaEnabled || !videoRef.current || !canvasRef.current || !sourceCanvasRef.current) {
        return;
      }
      
      try {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const sourceCanvas = sourceCanvasRef.current;
        
        if (video.videoWidth === 0 || video.videoHeight === 0) {
          animationFrameRef.current = requestAnimationFrame(processFrame);
          return;
        }
        
        // Update canvas dimensions if needed
        if (sourceCanvas.width !== video.videoWidth || sourceCanvas.height !== video.videoHeight) {
          sourceCanvas.width = video.videoWidth;
          sourceCanvas.height = video.videoHeight;
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
        }
        
        // Draw video frame to source canvas
        const sourceCtx = sourceCanvas.getContext('2d', { willReadFrequently: true });
        if (sourceCtx) {
          sourceCtx.drawImage(video, 0, 0);
          
          // Process frame with chroma key
          processFrameWithChromaKey(sourceCanvas, canvas, finalOptions);
          
          // Update performance metrics
          const frameRate = performanceMonitorRef.current.updateFrameRate();
          setProcessorState(prev => ({
            ...prev,
            frameRate,
            isProcessing: true,
            error: null,
          }));
        }
        
        animationFrameRef.current = requestAnimationFrame(processFrame);
      } catch (error) {
        handleError(error as Error);
      }
    }, [chromaEnabled, handleError]);
    
    // Start/stop processing
    useEffect(() => {
      if (chromaEnabled && stream) {
        setProcessorState(prev => ({ ...prev, isProcessing: true, error: null }));
        animationFrameRef.current = requestAnimationFrame(processFrame);
      } else {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        setProcessorState(prev => ({ ...prev, isProcessing: false }));
      }
      
      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };
    }, [chromaEnabled, stream, processFrame]);
    
    // Handle stream changes
    useEffect(() => {
      if (stream && videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          onStreamReady?.(stream);
        };
      }
      
      return () => {
        if (videoRef.current) {
          videoRef.current.srcObject = null;
        }
      };
    }, [stream, onStreamReady]);
    
    // Cleanup on unmount
    useEffect(() => {
      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        onStreamDisconnected?.();
      };
    }, [onStreamDisconnected]);
    
    // Expose video ref to parent
    useEffect(() => {
      if (typeof ref === 'function') {
        ref(videoRef.current);
      } else if (ref) {
        ref.current = videoRef.current;
      }
    }, [ref]);
    
    return (
      <div className={`relative w-full h-full ${className}`}>
        {/* Hidden video element for processing */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className={`absolute inset-0 w-full h-full object-contain ${
            chromaEnabled ? 'invisible' : 'visible'
          }`}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
          }}
        >
          <track kind="captions" />
        </video>
        
        {/* Hidden source canvas for processing */}
        <canvas
          ref={sourceCanvasRef}
          className="hidden"
          style={{ display: 'none' }}
        />
        
        {/* Output canvas with chroma key effect */}
        <canvas
          ref={canvasRef}
          className={`absolute inset-0 w-full h-full object-contain ${
            chromaEnabled ? 'visible' : 'invisible'
          }`}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
          }}
        />
        
        {/* Loading overlay */}
        {chromaEnabled && !processorState.isProcessing && !processorState.error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/10">
            <div className="text-white text-sm">Conectando con JUJO...</div>
          </div>
        )}
      </div>
    );
  }
);

ChromaKeyAvatar.displayName = 'ChromaKeyAvatar';