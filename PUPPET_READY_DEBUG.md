# 🎭 HeyGen Puppet Ready State Debug

## 🔍 **Problema Identificado**

ElevenLabs está funcionando perfectamente:
- ✅ Escucha el micrófono correctamente
- ✅ Transcribe el habla del usuario
- ✅ Genera respuestas AI inteligentes
- ✅ Envía `agent_response_event` con el texto

**PERO** el HeyGen puppet no está hablando porque `isPuppetReady` nunca se vuelve `true`.

## 🎯 **Análisis del Flujo**

### 1. **Inicialización del Puppet**
```
Usuario presiona "Comenzar Conversación"
↓
HeyGenPuppet.initialize() se llama
↓
startAvatar(PUPPET_CONFIG) se ejecuta
↓
STREAM_READY event debería dispararse
↓
onReady callback debería llamarse
↓
isPuppetReady debería volverse true
```

### 2. **Problema Detectado**
Los logs muestran:
```
🎭 HeyGen Puppet session state changed: inactive
🎭 HeyGen Puppet session state changed: inactive
🎭 HeyGen Puppet session state changed: inactive
```

**El sessionState nunca cambia a CONNECTED**, por lo que `onReady` nunca se llama.

## 🔧 **Debug Implementado**

### 1. **Logs Agregados**
```javascript
// En MinimalistElevenLabsAvatar.tsx
useEffect(() => {
  console.log("🎭 isPuppetReady changed to:", isPuppetReady);
}, [isPuppetReady]);

// En trySpeak function
console.log("🎭 trySpeak called - isPuppetReady:", isPuppetReady, "heygenPuppet.speak available:", !!(window as any).heygenPuppet?.speak);
console.log("🎭 Current state - isPuppetReady:", isPuppetReady, "window.heygenPuppet:", (window as any).heygenPuppet);
```

### 2. **Verificación de Estados**
```javascript
// En HeyGenPuppet.tsx
useEffect(() => {
  console.log("🎭 HeyGen Puppet session state changed:", sessionState);
  if (sessionState === StreamingAvatarSessionState.CONNECTED) {
    console.log("🎭 Puppet is now CONNECTED - calling onReady");
    onReady?.();
  }
}, [sessionState, onReady]);
```

## 🚨 **Posibles Causas**

### 1. **Problema de Token**
- El token de HeyGen podría estar expirado
- Error en la obtención del token
- Token inválido

### 2. **Problema de Configuración**
- `PUPPET_CONFIG` podría tener parámetros incorrectos
- `avatarName` o `voiceId` podrían ser inválidos
- Configuración de red incorrecta

### 3. **Problema de Timing**
- La inicialización podría estar fallando silenciosamente
- El WebSocket de HeyGen podría no conectarse
- Timeout en la conexión

### 4. **Problema de Eventos**
- Los eventos de HeyGen podrían no estar disparándose
- El `STREAM_READY` event podría no llegar
- El `onReady` callback podría no estar registrado correctamente

## 🔍 **Próximos Pasos de Debug**

### 1. **Verificar Token**
```javascript
// Agregar log en fetchAccessToken
console.log("🎭 HeyGen token obtained:", token.substring(0, 20) + "...");
```

### 2. **Verificar Configuración**
```javascript
// Agregar log en initializePuppet
console.log("🎭 PUPPET_CONFIG:", PUPPET_CONFIG);
```

### 3. **Verificar Eventos**
```javascript
// Agregar logs en todos los eventos de HeyGen
avatarRef.current.on(StreamingEvents.STREAM_READY, async (event) => {
  console.log("🎭 STREAM_READY event received:", event);
  // ...
});
```

### 4. **Verificar WebSocket**
```javascript
// Agregar logs en startAvatar
console.log("🎭 startAvatar called with config:", PUPPET_CONFIG);
```

## 🎯 **Solución Esperada**

Una vez que identifiquemos por qué `sessionState` no cambia a `CONNECTED`, el flujo debería ser:

```
🎭 HeyGen Puppet session state changed: connecting
🎭 HeyGen Puppet session state changed: connected
🎭 Puppet is now CONNECTED - calling onReady
🎭 HeyGen puppet is ready - setting isPuppetReady to true
🎭 isPuppetReady changed to: true
```

Y cuando ElevenLabs envíe una respuesta:
```
🤖 ElevenLabs agent responded: "Hola, ¿cómo estás?"
🎭 trySpeak called - isPuppetReady: true, heygenPuppet.speak available: true
🎭 HeyGen puppet displayed response
```

## 📋 **Para Probar**

1. **Refrescar la página**
2. **Abrir DevTools Console**
3. **Presionar "Comenzar Conversación"**
4. **Buscar logs que empiecen con "🎭"**
5. **Identificar dónde se rompe el flujo**

¡El problema está en la inicialización del HeyGen puppet, no en ElevenLabs! 🎭 