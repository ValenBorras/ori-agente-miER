import { ChromaKeyOptions } from '../../types/chromaKey';

export const DEFAULT_CHROMA_OPTIONS: ChromaKeyOptions = {
  whiteThreshold: 0.85,
  saturationThreshold: 0.1,
  tolerance: 0.05,
  smoothing: 0.1,
};

/**
 * Calculate brightness using luminance formula
 */
export function calculateBrightness(r: number, g: number, b: number): number {
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

/**
 * Calculate saturation (color purity)
 */
export function calculateSaturation(r: number, g: number, b: number): number {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  
  if (max === 0) return 0;
  return (max - min) / max;
}

/**
 * Determine if a pixel should be transparent (white background)
 */
export function isWhitePixel(
  r: number, 
  g: number, 
  b: number, 
  options: ChromaKeyOptions
): boolean {
  const brightness = calculateBrightness(r, g, b);
  const saturation = calculateSaturation(r, g, b);
  
  return brightness >= options.whiteThreshold && 
         saturation <= options.saturationThreshold;
}

/**
 * Apply edge smoothing to alpha values
 */
export function applySmoothingToAlpha(
  imageData: ImageData,
  width: number,
  height: number,
  smoothing: number
): void {
  const data = imageData.data;
  const tempAlpha = new Float32Array(width * height);
  
  // Copy alpha values
  for (let i = 0; i < width * height; i++) {
    tempAlpha[i] = data[i * 4 + 3] / 255;
  }
  
  // Apply smoothing
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      
      if (tempAlpha[idx] === 0) { // Transparent pixel
        let sum = 0;
        let count = 0;
        
        // Check surrounding pixels
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const neighborIdx = (y + dy) * width + (x + dx);
            if (tempAlpha[neighborIdx] > 0) {
              sum += tempAlpha[neighborIdx];
              count++;
            }
          }
        }
        
        if (count > 0) {
          const avgAlpha = sum / count;
          data[idx * 4 + 3] = Math.round(avgAlpha * smoothing * 255);
        }
      }
    }
  }
}

/**
 * Process frame with chroma key effect
 */
export function processFrameWithChromaKey(
  sourceCanvas: HTMLCanvasElement,
  targetCanvas: HTMLCanvasElement,
  options: ChromaKeyOptions
): void {
  const sourceCtx = sourceCanvas.getContext('2d', { willReadFrequently: true });
  const targetCtx = targetCanvas.getContext('2d', { willReadFrequently: true });
  
  if (!sourceCtx || !targetCtx) return;
  
  const width = sourceCanvas.width;
  const height = sourceCanvas.height;
  
  // Ensure target canvas matches source dimensions
  if (targetCanvas.width !== width || targetCanvas.height !== height) {
    targetCanvas.width = width;
    targetCanvas.height = height;
  }
  
  // Get image data
  const imageData = sourceCtx.getImageData(0, 0, width, height);
  const data = imageData.data;
  
  // Process pixels
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    
    if (isWhitePixel(r, g, b, options)) {
      data[i + 3] = 0; // Make transparent
    } else {
      // Enhance edges for non-white pixels
      const brightness = calculateBrightness(r, g, b);
      if (brightness > options.whiteThreshold - options.tolerance) {
        // Partial transparency for pixels close to white
        const factor = (brightness - (options.whiteThreshold - options.tolerance)) / options.tolerance;
        data[i + 3] = Math.round(255 * (1 - factor));
      }
    }
  }
  
  // Apply smoothing if enabled
  if (options.smoothing > 0) {
    applySmoothingToAlpha(imageData, width, height, options.smoothing);
  }
  
  // Draw processed image to target canvas
  targetCtx.clearRect(0, 0, width, height);
  targetCtx.putImageData(imageData, 0, 0);
}

/**
 * Performance monitoring utilities
 */
export class PerformanceMonitor {
  private frameCount = 0;
  private lastTime = 0;
  private frameRate = 0;
  
  updateFrameRate(): number {
    this.frameCount++;
    const now = performance.now();
    
    if (now - this.lastTime >= 1000) {
      this.frameRate = this.frameCount;
      this.frameCount = 0;
      this.lastTime = now;
    }
    
    return this.frameRate;
  }
  
  getFrameRate(): number {
    return this.frameRate;
  }
}