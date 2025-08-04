# 🎤 Audio Sensor Implementation

## 🎯 **Funcionalidad del Sensor de Audio**

El sensor de audio del micrófono ahora está completamente funcional y proporciona retroalimentación visual en tiempo real.

## 🔧 **Componentes Implementados**

### 1. **Audio Level Monitoring**
```javascript
const monitorAudio = useCallback(() => {
  if (!analyserRef.current || isMuted || conversationState !== ConversationState.LISTENING) {
    setAudioLevel(0);
    setIsUserSpeaking(false);
    animationFrameRef.current = requestAnimationFrame(monitorAudio);
    return;
  }

  const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
  analyserRef.current.getByteFrequencyData(dataArray);
  
  const volume = dataArray.reduce((a, b) => a + b) / dataArray.length;
  setAudioLevel(volume);

  // Detect if user is speaking (volume threshold)
  const isSpeaking = volume > 20; // Adjust threshold as needed
  setIsUserSpeaking(isSpeaking);

  animationFrameRef.current = requestAnimationFrame(monitorAudio);
}, [isMuted, conversationState]);
```

### 2. **Audio Context Setup**
```javascript
const initAudioMonitoring = useCallback(async () => {
  try {
    if (!mediaStreamRef.current) {
      mediaStreamRef.current = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        } 
      });
    }

    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }

    if (!analyserRef.current) {
      const source = audioContextRef.current.createMediaStreamSource(mediaStreamRef.current);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      source.connect(analyserRef.current);
    }

    monitorAudio();
  } catch (error) {
    console.error("Error initializing audio monitoring:", error);
  }
}, [monitorAudio]);
```

### 3. **Visual Indicator**
```javascript
const renderAudioIndicator = () => (
  <button
    onClick={handleMuteToggle}
    className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all duration-200 border-2 ${
      isMuted 
        ? 'bg-red-500 border-red-500 hover:bg-red-600' 
        : isUserSpeaking
          ? 'bg-green-500 border-green-500'
          : 'bg-white border-gray-300 hover:border-gray-400'
    }`}
    title={isUserSpeaking ? "Usuario hablando" : isMuted ? "Micrófono silenciado" : "Micrófono activo"}
  >
    <div className="flex items-end gap-0.5 h-3 sm:h-4">
      {[1, 2, 3, 4].map((bar) => (
        <div
          key={bar}
          className={`w-0.5 sm:w-1 rounded-full transition-all duration-100 ${
            isMuted 
              ? 'bg-white' 
              : isUserSpeaking
                ? 'bg-white'
                : audioLevel > bar * 15 
                  ? 'bg-green-500' 
                  : 'bg-gray-400'
          }`}
          style={{
            height: `${bar * 2}px`,
            opacity: isMuted ? 0.8 : isUserSpeaking ? 1 : audioLevel > bar * 15 ? 1 : 0.4
          }}
        />
      ))}
    </div>
  </button>
);
```

## 🎨 **Estados Visuales**

### **1. Micrófono Silenciado**
- **Color:** Rojo (`bg-red-500`)
- **Barras:** Blancas, opacidad 0.8
- **Estado:** `isMuted = true`

### **2. Usuario Hablando**
- **Color:** Verde (`bg-green-500`)
- **Barras:** Blancas, opacidad 1.0
- **Estado:** `isUserSpeaking = true`
- **Condición:** `volume > 20`

### **3. Micrófono Activo (Silencio)**
- **Color:** Blanco con borde gris
- **Barras:** Grises, opacidad 0.4
- **Estado:** `isMuted = false` y `isUserSpeaking = false`

### **4. Micrófono Activo (Con Audio)**
- **Color:** Blanco con borde gris
- **Barras:** Verdes según nivel de audio
- **Estado:** `isMuted = false` y `audioLevel > threshold`

## ⚙️ **Configuración Técnica**

### **Audio Constraints:**
```javascript
{
  sampleRate: 16000,      // 16kHz sample rate
  channelCount: 1,        // Mono audio
  echoCancellation: true, // Cancel echo
  noiseSuppression: true, // Suppress noise
  autoGainControl: true,  // Auto gain control
}
```

### **Analyser Configuration:**
```javascript
analyserRef.current.fftSize = 256; // Frequency bin count
```

### **Volume Threshold:**
```javascript
const isSpeaking = volume > 20; // Adjustable threshold
```

## 🔄 **Flujo de Funcionamiento**

### **1. Inicialización**
1. Usuario presiona "Comenzar Conversación"
2. Se inicializa ElevenLabs
3. Se llama `initAudioMonitoring()`
4. Se solicita acceso al micrófono
5. Se configura AudioContext y AnalyserNode
6. Se inicia `monitorAudio()` loop

### **2. Monitoreo Continuo**
1. `monitorAudio()` se ejecuta cada frame
2. Se obtienen datos de frecuencia del audio
3. Se calcula el volumen promedio
4. Se actualiza `audioLevel` state
5. Se detecta si el usuario está hablando
6. Se actualiza `isUserSpeaking` state

### **3. Limpieza**
1. Al desconectar o parar conversación
2. Se cancela `requestAnimationFrame`
3. Se resetean estados de audio
4. Se detienen tracks del MediaStream

## 🎯 **Características**

### ✅ **Funcionalidades Implementadas:**
- **Monitoreo en tiempo real** del nivel de audio
- **Detección automática** de cuando el usuario habla
- **Indicador visual** con barras animadas
- **Estados diferenciados** (muted, speaking, active)
- **Limpieza automática** de recursos
- **Configuración optimizada** para conversación

### 🎨 **Feedback Visual:**
- **4 barras** que se iluminan según el nivel de audio
- **Colores dinámicos** según el estado
- **Animaciones suaves** con transiciones
- **Tooltips informativos** al hacer hover

### 🔧 **Optimizaciones:**
- **RequestAnimationFrame** para rendimiento óptimo
- **Cleanup automático** para evitar memory leaks
- **Threshold configurable** para sensibilidad
- **Estados separados** para ElevenLabs y visual feedback

## 🚀 **Resultado**

¡El sensor de audio ahora funciona perfectamente! 🎤✨

- ✅ **Detecta cuando hablas** en tiempo real
- ✅ **Muestra nivel de audio** con barras animadas
- ✅ **Cambia de color** según el estado
- ✅ **Funciona independientemente** de ElevenLabs
- ✅ **Limpieza automática** de recursos

¡Prueba hablando y verás las barras moverse! 🎵 