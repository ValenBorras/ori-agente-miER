# Microphone Noise Monitor Component

A comprehensive React component for real-time microphone audio level detection with visual feedback, designed to enhance avatar interaction experiences.

## Features

### 🎤 Real-time Audio Processing
- **Web Audio API Integration**: Uses modern browser APIs for high-performance audio processing
- **60fps Smooth Animations**: Real-time audio level visualization with smooth transitions
- **Configurable Sensitivity**: Adjustable sensitivity levels (1-10) for different environments
- **Noise Suppression**: Built-in echo cancellation and noise suppression
- **FFT Analysis**: 256-point FFT for accurate frequency analysis

### 🎨 Visual Feedback
- **Multiple Visualization Styles**: Bars, circle, and pulse animations
- **Color-coded Levels**: Green (low), yellow (medium), red (high) audio levels
- **Responsive Design**: Adapts to different screen sizes and container dimensions
- **Smooth Transitions**: CSS transitions for fluid state changes

### 🎛️ User Controls
- **Mute/Unmute Toggle**: Visual button with clear on/off states
- **Keyboard Shortcuts**: Press 'M' to toggle mute, spacebar for additional actions
- **Permission Handling**: Graceful microphone permission requests
- **Error Recovery**: Clear error messages and retry mechanisms

### ♿ Accessibility
- **ARIA Labels**: Screen reader support for all interactive elements
- **Keyboard Navigation**: Full keyboard accessibility
- **High Contrast**: Support for high contrast mode
- **Reduced Motion**: Respects user's motion preferences

## Installation

The component is built with TypeScript and uses the following dependencies:

```bash
npm install @heygen/streaming-avatar
```

## Basic Usage

```tsx
import { MicrophoneNoiseMonitor } from './components/MicrophoneNoiseMonitor';

function MyComponent() {
  const handleMuteToggle = (isMuted: boolean) => {
    console.log('Microphone muted:', isMuted);
  };

  const handleAudioLevel = (level: number) => {
    console.log('Audio level:', level);
  };

  return (
    <MicrophoneNoiseMonitor
      onMuteToggle={handleMuteToggle}
      onAudioLevel={handleAudioLevel}
      variant="bars"
      size="medium"
      sensitivity={5}
    />
  );
}
```

## Props Interface

```typescript
interface MicrophoneNoiseMonitorProps {
  onMuteToggle?: (isMuted: boolean) => void;
  onAudioLevel?: (level: number) => void;
  sensitivity?: number; // 1-10, default 5
  showMuteButton?: boolean; // default true
  variant?: 'bars' | 'circle' | 'pulse';
  size?: 'small' | 'medium' | 'large';
  autoStart?: boolean; // default false
  className?: string;
}
```

### Props Description

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onMuteToggle` | `(isMuted: boolean) => void` | - | Callback when mute state changes |
| `onAudioLevel` | `(level: number) => void` | - | Callback with current audio level (0-100) |
| `sensitivity` | `number` | `5` | Audio sensitivity (1-10, higher = more sensitive) |
| `showMuteButton` | `boolean` | `true` | Whether to show the mute button |
| `variant` | `'bars' \| 'circle' \| 'pulse'` | `'bars'` | Visual style for audio level indicator |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | Size of the component |
| `autoStart` | `boolean` | `false` | Automatically start listening when permission granted |
| `className` | `string` | - | Additional CSS classes |

## Visualization Variants

### Bars (Default)
Animated vertical bars that respond to audio levels, similar to an audio equalizer.

```tsx
<MicrophoneNoiseMonitor variant="bars" />
```

### Circle
Circular progress ring that fills based on audio level, with a center dot that pulses.

```tsx
<MicrophoneNoiseMonitor variant="circle" />
```

### Pulse
Simple pulsing circle that grows and changes opacity with audio level.

```tsx
<MicrophoneNoiseMonitor variant="pulse" />
```

## Integration with Avatar Components

### Basic Integration

```tsx
import { MicrophoneNoiseMonitor } from './components/MicrophoneNoiseMonitor';

function AvatarWithMicrophone() {
  const [audioLevel, setAudioLevel] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  const handleAudioLevel = (level: number) => {
    setAudioLevel(level);
    // Trigger avatar animations or other effects
    if (level > 30) {
      console.log('User is speaking');
    }
  };

  return (
    <div className="avatar-container">
      {/* Avatar component */}
      <AvatarComponent />
      
      {/* Microphone monitor */}
      <MicrophoneNoiseMonitor
        variant="circle"
        onMuteToggle={setIsMuted}
        onAudioLevel={handleAudioLevel}
        autoStart={true}
      />
    </div>
  );
}
```

### Advanced Integration with HeyGen Avatar

```tsx
import { MicrophoneNoiseMonitor } from './components/MicrophoneNoiseMonitor';
import { useStreamingAvatarSession } from './logic/useStreamingAvatarSession';

function InteractiveAvatar() {
  const { sessionState } = useStreamingAvatarSession();
  const [audioLevel, setAudioLevel] = useState(0);

  const handleAudioLevel = (level: number) => {
    setAudioLevel(level);
    
    // Use audio level to enhance avatar interaction
    if (level > 50) {
      // High audio level - could trigger avatar attention
      console.log('User speaking loudly');
    } else if (level > 20) {
      // Normal speaking level
      console.log('User speaking normally');
    }
  };

  return (
    <div className="avatar-interface">
      {/* Avatar video */}
      <AvatarVideo />
      
      {/* Show microphone monitor only when connected */}
      {sessionState === 'CONNECTED' && (
        <MicrophoneNoiseMonitor
          variant="circle"
          size="medium"
          sensitivity={7}
          onAudioLevel={handleAudioLevel}
          autoStart={true}
        />
      )}
    </div>
  );
}
```

## Custom Hooks

### useMicrophone

The core hook that handles microphone access and audio processing.

```tsx
import { useMicrophone } from './logic/useMicrophone';

function MyComponent() {
  const {
    isListening,
    hasPermission,
    isSupported,
    audioLevel,
    error,
    requestPermission,
    startListening,
    stopListening
  } = useMicrophone({
    sensitivity: 5,
    fftSize: 256,
    updateFrequency: 60
  });

  // Use the hook's functionality
}
```

### useKeyboardShortcuts

Handles keyboard shortcuts for mute/unmute functionality.

```tsx
import { useKeyboardShortcuts } from './logic/useKeyboardShortcuts';

function MyComponent() {
  const handleMuteToggle = () => {
    // Toggle mute logic
  };

  useKeyboardShortcuts({
    onMuteToggle: handleMuteToggle,
    enabled: true
  });
}
```

## Browser Compatibility

### Supported Browsers
- Chrome 66+
- Firefox 55+
- Safari 11+
- Edge 79+

### Fallback Behavior
When Web Audio API is not supported, the component shows a static microphone icon with manual mute button.

## Performance Considerations

### Audio Processing
- Uses `requestAnimationFrame` for smooth 60fps updates
- Efficient FFT analysis with 256-point samples
- Automatic cleanup of audio contexts and streams

### Memory Management
- Proper cleanup of audio resources on component unmount
- Efficient event listener management
- Minimal re-renders with optimized state updates

## Error Handling

The component handles various error scenarios gracefully:

### Permission Denied
- Shows clear error message with instructions
- Provides retry mechanism
- Explains how to enable microphone in browser settings

### Browser Not Supported
- Shows fallback UI
- Explains browser requirements
- Suggests alternative browsers

### Audio Context Errors
- Handles audio context creation failures
- Provides user-friendly error messages
- Offers recovery options

## Styling and Theming

### Default Styling
The component uses Tailwind CSS classes and can be customized with additional classes:

```tsx
<MicrophoneNoiseMonitor 
  className="my-custom-class"
  variant="circle"
/>
```

### Color Schemes
- **Green**: Active/listening state
- **Red**: Muted state
- **Gray**: Inactive/no permission
- **Blue/Teal**: Moderate audio levels

### Dark Mode Support
The component automatically adapts to dark mode using Tailwind's dark: variants.

## Testing

### Manual Testing Checklist
- [ ] Microphone permission request works
- [ ] Audio level visualization responds to real input
- [ ] Mute button toggles correctly
- [ ] Keyboard shortcuts work (M key)
- [ ] Error states display properly
- [ ] Component works on mobile devices
- [ ] Performance remains smooth during audio processing

### Automated Testing
```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { MicrophoneNoiseMonitor } from './MicrophoneNoiseMonitor';

test('renders microphone monitor', () => {
  render(<MicrophoneNoiseMonitor />);
  expect(screen.getByRole('button')).toBeInTheDocument();
});

test('handles mute toggle', () => {
  const handleMuteToggle = jest.fn();
  render(<MicrophoneNoiseMonitor onMuteToggle={handleMuteToggle} />);
  
  const muteButton = screen.getByRole('button');
  fireEvent.click(muteButton);
  
  expect(handleMuteToggle).toHaveBeenCalledWith(true);
});
```

## Examples

### Demo Component
See `MicrophoneNoiseMonitorDemo.tsx` for a complete demonstration with all features and configuration options.

### Avatar Integration
See `MinimalistAvatarWithMicrophone.tsx` for an example of integrating the microphone monitor with a HeyGen avatar component.

## Troubleshooting

### Common Issues

**Microphone not working**
- Check browser permissions
- Ensure HTTPS (required for getUserMedia)
- Verify microphone is not being used by another application

**Audio level not responding**
- Check microphone sensitivity settings
- Verify audio input is working in other applications
- Check browser console for errors

**Component not rendering**
- Ensure all dependencies are installed
- Check for TypeScript compilation errors
- Verify component imports are correct

### Debug Mode
Enable debug logging by setting the sensitivity to a high value and checking browser console for audio level updates.

## Contributing

When contributing to this component:

1. Follow the existing code style and patterns
2. Add TypeScript types for all new props and functions
3. Include accessibility features for new interactive elements
4. Test across different browsers and devices
5. Update documentation for new features

## License

This component is part of the Interactive Avatar NextJS Demo project. 