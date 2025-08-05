# HeyGen Avatar Chroma Key System

A real-time white background removal system for HeyGen Streaming Avatars built with Next.js, React, and TypeScript.

## Features

- ✨ **Real-time Processing**: Remove white backgrounds in real-time at 60 FPS
- 🎛️ **Adjustable Parameters**: Fine-tune detection sensitivity and edge smoothing
- ⚡ **High Performance**: Optimized canvas processing with performance monitoring
- 🔧 **Easy Integration**: Drop-in replacement for existing video components
- 📱 **Responsive Design**: Works on desktop and mobile devices
- 🎯 **TypeScript Support**: Full type safety and IntelliSense support

## Components Overview

### `ChromaKeyAvatar`
Main component that handles real-time chroma key processing.

```tsx
import { ChromaKeyAvatar } from './components/ChromaKeyAvatar';

<ChromaKeyAvatar
  sessionState={sessionState}
  stream={stream}
  chromaOptions={chromaOptions}
  onStreamReady={handleStreamReady}
  onStreamDisconnected={handleStreamDisconnected}
  enableChromaByDefault={true}
  className="rounded-lg"
/>
```

### `ChromaKeyControls`
Adjustable controls for fine-tuning chroma key parameters.

```tsx
import { ChromaKeyControls } from './components/ChromaKeyControls';

<ChromaKeyControls
  options={chromaOptions}
  onOptionsChange={setChromaOptions}
/>
```

## Configuration Options

### ChromaKeyOptions Interface

```typescript
interface ChromaKeyOptions {
  whiteThreshold: number;      // 0.85 - Minimum brightness to consider "white" (0-1)
  saturationThreshold: number; // 0.1 - Maximum saturation for white pixels (0-1) 
  tolerance: number;           // 0.05 - Tolerance for color variations from pure white
  smoothing: number;           // 0.1 - Edge smoothing factor
}
```

### Default Settings

```typescript
const DEFAULT_CHROMA_OPTIONS: ChromaKeyOptions = {
  whiteThreshold: 0.85,
  saturationThreshold: 0.1,
  tolerance: 0.05,
  smoothing: 0.1,
};
```

## How It Works

### 1. White Background Detection
The system uses a combination of brightness and saturation analysis:

- **Brightness Calculation**: Uses luminance formula (0.299×R + 0.587×G + 0.114×B)
- **Saturation Detection**: Identifies color purity to distinguish white from colored pixels
- **Tolerance System**: Handles variations in white color due to lighting and compression

### 2. Real-time Processing
- Captures video frames using `requestAnimationFrame`
- Processes each pixel through the white detection algorithm
- Applies edge smoothing for natural-looking transparency
- Renders the result to a canvas with transparent background

### 3. Performance Optimization
- Uses `willReadFrequently: true` for canvas context optimization
- Implements frame rate monitoring and display
- Proper cleanup with `cancelAnimationFrame`
- Memory-efficient pixel processing

## Usage Examples

### Basic Integration

```tsx
import { useState } from 'react';
import { ChromaKeyAvatar } from './components/ChromaKeyAvatar';
import { DEFAULT_CHROMA_OPTIONS } from './components/utils/chromaKey';

function MyAvatarComponent() {
  const [chromaOptions, setChromaOptions] = useState(DEFAULT_CHROMA_OPTIONS);
  
  return (
    <ChromaKeyAvatar
      sessionState={sessionState}
      stream={stream}
      chromaOptions={chromaOptions}
      enableChromaByDefault={true}
    />
  );
}
```

### With Custom Settings

```tsx
const customChromaOptions = {
  whiteThreshold: 0.9,     // More strict white detection
  saturationThreshold: 0.05, // Lower saturation tolerance
  tolerance: 0.03,         // Tighter color matching
  smoothing: 0.2,          // More edge smoothing
};

<ChromaKeyAvatar
  sessionState={sessionState}
  stream={stream}
  chromaOptions={customChromaOptions}
  enableChromaByDefault={true}
/>
```

## File Structure

```
├── types/
│   └── chromaKey.ts              # TypeScript interfaces
├── components/
│   ├── ChromaKeyAvatar.tsx       # Main chroma key component
│   ├── ChromaKeyControls.tsx     # Parameter adjustment controls
│   └── utils/
│       └── chromaKey.ts          # Core processing algorithms
└── app/
    └── chroma-demo/
        └── page.tsx              # Demo page
```

## Parameter Tuning Guide

### White Threshold (0.5 - 1.0)
- **Lower values**: Detect darker shades as white (more aggressive)
- **Higher values**: Only very bright pixels are considered white (more conservative)
- **Recommended**: 0.85 for most lighting conditions

### Saturation Threshold (0.0 - 0.3)
- **Lower values**: Only pure white/gray pixels are removed
- **Higher values**: Slightly colored pixels are also removed
- **Recommended**: 0.1 for balanced color preservation

### Tolerance (0.0 - 0.2)
- **Lower values**: Strict color matching
- **Higher values**: More forgiving for lighting variations
- **Recommended**: 0.05 for stable lighting, 0.1 for variable lighting

### Smoothing (0.0 - 0.5)
- **0**: No edge smoothing (sharp edges)
- **Higher values**: More blur on transparency edges
- **Recommended**: 0.1 for natural-looking edges

## Performance Considerations

- **Frame Rate**: Targets 60 FPS, displays actual performance in real-time
- **Memory Usage**: Optimized pixel processing minimizes memory allocation
- **CPU Usage**: Efficient algorithms reduce computational overhead
- **Canvas Optimization**: Uses appropriate context settings for frequent reads

## Browser Compatibility

- ✅ Chrome/Chromium (recommended)
- ✅ Safari (WebKit)
- ✅ Firefox
- ✅ Edge

## Troubleshooting

### Low Frame Rate
- Reduce canvas size if needed
- Lower smoothing value
- Check for other CPU-intensive processes

### Inconsistent Background Removal
- Adjust white threshold for lighting conditions
- Increase tolerance for varying lighting
- Fine-tune saturation threshold

### Visible Edges
- Increase smoothing value
- Adjust tolerance for softer transitions
- Ensure consistent lighting on the background

## Demo

Visit `/chroma-demo` to see the chroma key system in action with an interactive demo and parameter controls.

## Integration with HeyGen SDK

The chroma key system seamlessly integrates with HeyGen's Streaming Avatar SDK:

```tsx
// Initialize avatar with chroma key
const avatar = new StreamingAvatar({ token: accessToken });

// Start session
await avatar.createStartAvatar(config);

// The ChromaKeyAvatar component automatically handles the stream
<ChromaKeyAvatar 
  stream={avatarStream} 
  sessionState={sessionState}
  enableChromaByDefault={true}
/>
```

## License

This chroma key implementation is built for use with HeyGen's Streaming Avatar SDK and follows the same licensing terms as your HeyGen integration.