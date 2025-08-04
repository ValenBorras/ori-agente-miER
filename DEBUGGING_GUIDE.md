# 🐛 Debugging the "Preparando" Issue

If the button is stuck showing "Preparando..." instead of "Comenzar Conversación", here's how to debug:

## 🔍 Debug Steps

### 1. Open Browser Console
Press F12 and check the Console tab for log messages.

### 2. Look for These Key Messages

**Expected initialization flow:**
```
🎭 HeyGen Puppet component mounted, starting initialization...
🎭 Session state: inactive
🎭 Initializing HeyGen avatar in puppet mode
✅ HeyGen access token obtained
🎭 HeyGen Puppet session state changed: connecting
🎭 HeyGen Puppet session state changed: connected
🎭 Puppet is now CONNECTED - calling onReady
🎭 HeyGen puppet is ready - setting isPuppetReady to true
```

### 3. Common Issues & Solutions

#### Issue: "Error fetching HeyGen access token"
**Solution:** Check your HeyGen API key in `.env.local`
```env
HEYGEN_API_KEY=your_actual_heygen_api_key_here
```

#### Issue: Session state stuck at "connecting"
**Solutions:** 
- Check network connection
- Verify HeyGen avatar/voice/knowledge IDs are valid
- Try refreshing the page

#### Issue: "Avatar reference not available"
**Solution:** The HeyGen SDK may not be properly initialized

#### Issue: No console messages at all
**Solution:** Check if the component is rendering - look for browser errors

### 4. Manual Test

You can manually test the puppet in the browser console:
```javascript
// Check if puppet is available
console.log('Puppet ready:', window.heygenPuppet?.isReady);

// Manually trigger ready state (for testing)
if (window.heygenPuppet) {
  console.log('Puppet state:', window.heygenPuppet);
}
```

### 5. Environment Check

Verify your `.env.local` file has all required variables:
```env
# HeyGen (required)
HEYGEN_API_KEY=your_heygen_api_key_here
NEXT_PUBLIC_AVATAR=8f059ad755ff4e62b103f2e3b2f127af
NEXT_PUBLIC_VOICE=cddb6172a34a4f83ae225892c4219d31

# ElevenLabs (required) 
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
NEXT_PUBLIC_ELEVENLABS_AGENT_ID=kRdQVspuGMQWp8QZ3Jnp
```

### 6. Quick Fix

If the issue persists, try:
1. Restart the dev server: `npm run dev`
2. Clear browser cache (Ctrl+Shift+R)
3. Check if all environment variables are loaded

### 7. Fallback Test

Create a simple test page to isolate the issue:
```jsx
// pages/test-puppet.jsx
import { HeyGenPuppet } from '@/components/HeyGenPuppet';

export default function TestPuppet() {
  return (
    <div style={{ width: '400px', height: '400px' }}>
      <HeyGenPuppet
        onReady={() => console.log('TEST: Puppet ready!')}
        onError={(error) => console.error('TEST: Puppet error:', error)}
      />
    </div>
  );
}
```

## 🎯 Expected Result

After fixing, you should see:
- Console logs showing successful initialization
- Button changes from "Preparando..." to "Comenzar Conversación"
- Clicking the button successfully starts the ElevenLabs conversation