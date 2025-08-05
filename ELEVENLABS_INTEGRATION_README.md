# ElevenLabs + HeyGen Avatar Integration

This project has been updated to use **ElevenLabs Conversational AI as the primary conversation handler** with **HeyGen Avatar serving as a visual puppet**. This new architecture provides more intelligent conversations while maintaining the visual appeal of HeyGen avatars.

## 🏗️ Architecture Overview

```
User Voice/Text → ElevenLabs Agent (Brain) → Text Response → HeyGen Avatar (Face)
```

### ElevenLabs Conversational AI (Primary Brain) 🧠
- **Speech Recognition**: Converts user speech to text
- **Conversation Logic**: Handles all AI reasoning and responses
- **Knowledge Base**: Processes queries against configured knowledge
- **Context Management**: Maintains conversation history and context

### HeyGen Avatar (Visual Puppet) 🎭
- **Visual Presentation**: Displays avatar video and animations
- **Lip-Sync**: Synchronizes mouth movements with speech
- **Puppet Mode**: Only speaks what ElevenLabs tells it to say
- **NO conversation logic**: Pure visual display layer

## 🚀 Key Features

- **Natural Conversations**: ElevenLabs handles complex conversational AI
- **Visual Appeal**: HeyGen provides realistic avatar animations
- **Real-time Streaming**: Low-latency audio streaming and processing
- **Secure Architecture**: API keys protected on server-side
- **Modular Design**: Clear separation between conversation brain and visual face

## 📁 Project Structure

```
├── lib/
│   └── elevenLabsConversation.ts    # ElevenLabs WebSocket service
├── components/
│   ├── MinimalistElevenLabsAvatar.tsx    # Main component (new architecture)
│   ├── HeyGenPuppet.tsx                  # HeyGen in puppet mode
│   ├── ConversationManager.tsx           # Bridge between ElevenLabs & HeyGen
│   └── ElevenLabsAvatarDemo.tsx         # Demo page
├── app/
│   ├── api/elevenlabs-config/          # Secure config API
│   └── page.tsx                        # Updated main page
└── env.example                         # Updated environment variables
```

## 🔧 Setup Instructions

### 1. Environment Variables

Create a `.env.local` file with the following variables:

```env
# HeyGen API Configuration (existing)
HEYGEN_API_KEY=your_heygen_api_key_here
NEXT_PUBLIC_BASE_API_URL=https://api.heygen.com
NEXT_PUBLIC_AVATAR=your_avatar_id
NEXT_PUBLIC_VOICE=your_voice_id
NEXT_PUBLIC_KNOWLEDGE=your_knowledge_id
NEXT_PUBLIC_INTRODUCTION="Your intro message"

# ElevenLabs Conversational AI Configuration (new)
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
NEXT_PUBLIC_ELEVENLABS_AGENT_ID=your_elevenlabs_agent_id_here
```

### 2. ElevenLabs Setup

1. **Create ElevenLabs Account**: Sign up at [elevenlabs.io](https://elevenlabs.io)
2. **Get API Key**: Go to your profile settings and generate an API key
3. **Create Conversational Agent**: 
   - Go to Conversational AI section
   - Create a new agent
   - Configure voice, personality, and knowledge base
   - Copy the Agent ID

### 3. HeyGen Setup (existing)

1. **HeyGen Account**: Ensure you have a HeyGen account and API key
2. **Avatar Configuration**: Use existing avatar, voice, and knowledge IDs

### 4. Install Dependencies

```bash
npm install
# or
yarn install
```

### 5. Run the Application

```bash
npm run dev
# or
yarn dev
```

## 🎯 How It Works

### Conversation Flow

1. **User Interaction**: User speaks into microphone or types text
2. **ElevenLabs Processing**: 
   - Speech is streamed to ElevenLabs WebSocket
   - ElevenLabs performs speech recognition
   - AI processes the request using configured knowledge base
   - ElevenLabs generates intelligent response text
3. **HeyGen Display**: 
   - Response text is sent to HeyGen avatar
   - Avatar speaks the response with lip-sync
   - User sees intelligent conversation through avatar

### Key Components

#### `ElevenLabsConversationService`
```javascript
// Handles WebSocket connection to ElevenLabs
const service = new ElevenLabsConversationService(agentId, apiKey);
await service.startConversation();
```

#### `HeyGenPuppet`
```javascript
// HeyGen avatar in puppet mode - only visual display
<HeyGenPuppet 
  onReady={() => console.log("Puppet ready")}
  onSpeakingStart={() => setIsSpeaking(true)}
/>
```

#### `MinimalistElevenLabsAvatar`
```javascript
// Main component combining ElevenLabs + HeyGen
<MinimalistElevenLabsAvatar />
```

## 🔒 Security Features

- **API Key Protection**: ElevenLabs API key is never exposed to client-side
- **Secure Endpoints**: Configuration fetched through secure API routes
- **Environment Variables**: Sensitive data stored in server environment

## 🐛 Troubleshooting

### Common Issues

1. **"Missing ELEVENLABS_API_KEY"**
   - Ensure API key is set in `.env.local`
   - Restart development server after adding variables

2. **"WebSocket connection failed"**
   - Check ElevenLabs API key is valid
   - Verify agent ID is correct
   - Check internet connection

3. **"Puppet not ready"**
   - Wait for HeyGen avatar to initialize
   - Check HeyGen API key and configuration
   - Verify avatar ID exists

4. **"Microphone access denied"**
   - Allow microphone permissions in browser
   - Check browser security settings
   - Ensure HTTPS in production

### Debug Mode

Enable debug logging by adding to browser console:
```javascript
localStorage.setItem('debug', 'elevenlabs:*');
```

## 📊 Performance Notes

- **Latency**: ~200-500ms for speech recognition and response
- **Audio Quality**: 16kHz, mono, optimized for speech
- **Bandwidth**: Moderate - real-time audio streaming
- **Browser Support**: Modern browsers with WebSocket and WebRTC support

## 🚦 API Endpoints

### `/api/elevenlabs-config` (GET)
Returns public configuration (Agent ID only)

### `/api/elevenlabs-config` (POST)  
Returns API key for client-side WebSocket authentication (secured)

### `/api/get-access-token` (POST)
Returns HeyGen access token (existing)

## 📈 Future Enhancements

- [ ] Multi-language support
- [ ] Conversation history persistence
- [ ] Voice activity detection improvements
- [ ] Mobile app support
- [ ] Analytics and conversation insights
- [ ] Custom knowledge base integration
- [ ] Emotion detection and avatar mood changes

## 🤝 Contributing

1. Follow the established architecture pattern
2. Keep ElevenLabs as conversation brain, HeyGen as visual puppet
3. Maintain security practices (no client-side API keys)
4. Add comprehensive error handling
5. Update this documentation for any changes

## 📝 License

This project maintains the same license as the original HeyGen integration.

---

**Architecture Summary**: ElevenLabs Conversational AI is the BRAIN 🧠, HeyGen Avatar is the FACE 🎭. All intelligence flows through ElevenLabs, all visuals through HeyGen.