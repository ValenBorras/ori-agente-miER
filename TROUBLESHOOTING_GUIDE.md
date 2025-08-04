# 🔧 Troubleshooting Guide - ElevenLabs + HeyGen Integration

## 🚨 Problemas Comunes y Soluciones

### 1. **ElevenLabs se desconecta automáticamente**

**Síntomas:**
- ElevenLabs WebSocket se desconecta después de unos segundos
- El avatar de HeyGen sigue streamando sin control
- Vuelve el botón "Comenzar Conversación"

**Soluciones implementadas:**
- ✅ **Keep-alive automático**: Envía `user_activity` cada 30 segundos
- ✅ **Delay de inicialización**: Espera 2 segundos antes de conectar ElevenLabs
- ✅ **Retry con timeout**: Espera hasta 5 segundos para que el puppet esté listo

**Para probar:**
```javascript
// En la consola del navegador
console.log('ElevenLabs keep-alive activo:', window.elevenLabsKeepAlive);
```

### 2. **HeyGen puppet no está listo cuando ElevenLabs responde**

**Síntomas:**
- Error: "⚠️ HeyGen puppet not ready to display response"
- ElevenLabs responde pero el avatar no habla

**Soluciones implementadas:**
- ✅ **Retry automático**: Intenta hasta 10 veces con 500ms de intervalo
- ✅ **Delay de inicialización**: Espera que HeyGen esté completamente listo
- ✅ **Verificación de estado**: Solo envía respuestas cuando el puppet está CONNECTED

### 3. **Avatar de HeyGen se queda streamando sin control**

**Síntomas:**
- El avatar sigue moviéndose después de cerrar la conversación
- No hay manera de detenerlo
- Botón de "Terminar" no funciona

**Soluciones implementadas:**
- ✅ **Botón "Forzar Cierre"**: Botón rojo de emergencia para cerrar todo
- ✅ **Cleanup mejorado**: Detiene tanto ElevenLabs como HeyGen
- ✅ **Reset de estados**: Limpia todos los estados al cerrar

### 4. **Múltiples sesiones de HeyGen**

**Síntomas:**
- Error: "There is already an active session"
- Sesiones duplicadas

**Soluciones implementadas:**
- ✅ **Verificación de estado**: Solo inicializa si `sessionState === INACTIVE`
- ✅ **Token único**: Solo obtiene token si `!avatarRef.current`
- ✅ **Prevención de reinicialización**: Evita múltiples llamadas a `initAvatar`

## 🎯 **Flujo de Debugging**

### Paso 1: Verificar Estado Inicial
```javascript
// En consola del navegador
console.log('HeyGen Puppet State:', window.heygenPuppet?.isReady);
console.log('ElevenLabs State:', window.elevenLabsConversation?.isActive);
```

### Paso 2: Verificar Logs de Inicialización
Buscar en la consola:
```
🎭 HeyGen Puppet session state changed: inactive
🎭 Initializing HeyGen avatar in puppet mode
✅ HeyGen access token obtained
🎭 HeyGen Puppet session state changed: connecting
🎭 HeyGen Puppet session state changed: connected
🎭 Puppet is now CONNECTED - calling onReady
✅ HeyGen puppet initialized successfully
🎙️ Starting ElevenLabs conversation with agent: kRdQVspuGMQWp8QZ3Jnp
🎙️ ElevenLabs WebSocket connected
✅ ElevenLabs conversation connected
```

### Paso 3: Verificar Keep-Alive
Buscar en la consola:
```
🎙️ ElevenLabs message: ping {ping_event: {...}, type: 'ping'}
```

## 🛠️ **Botones de Control**

### Botones Disponibles:
1. **🎤 Microphone**: Toggle mute (para audio monitoring)
2. **📞 End Call**: Termina la conversación normalmente
3. **🔄 Restart**: Reinicia la conversación completa
4. **❌ Force Close**: Cierre de emergencia (rojo)

### Cuándo usar cada uno:
- **End Call**: Terminación normal
- **Restart**: Si la conversación se comporta raro
- **Force Close**: Si el avatar se queda colgado

## 🔍 **Debugging Avanzado**

### Verificar Conexiones Activas:
```javascript
// En consola del navegador
console.log('Active WebSocket connections:', {
  elevenLabs: window.elevenLabsWebSocket?.readyState,
  heyGen: window.heygenWebSocket?.readyState
});
```

### Verificar Estados de Componentes:
```javascript
// En consola del navegador
console.log('Component States:', {
  conversationState: window.conversationState,
  isPuppetReady: window.isPuppetReady,
  isInitializing: window.isInitializing
});
```

### Forzar Limpieza Manual:
```javascript
// En consola del navegador (emergencia)
if (window.heygenPuppet?.stop) window.heygenPuppet.stop();
if (window.elevenLabsConversation?.stop) window.elevenLabsConversation.stop();
location.reload(); // Último recurso
```

## 📋 **Checklist de Verificación**

### Antes de Reportar un Bug:
- [ ] ¿Refrescaste la página después de los cambios?
- [ ] ¿Verificaste que las variables de entorno estén configuradas?
- [ ] ¿Revisaste la consola del navegador para errores?
- [ ] ¿Intentaste el botón "Force Close"?
- [ ] ¿Los logs muestran el flujo correcto de inicialización?

### Variables de Entorno Requeridas:
```env
# HeyGen
HEYGEN_API_KEY=your_heygen_api_key_here
NEXT_PUBLIC_AVATAR=8f059ad755ff4e62b103f2e3b2f127af
NEXT_PUBLIC_VOICE=cddb6172a34a4f83ae225892c4219d31

# ElevenLabs
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
NEXT_PUBLIC_ELEVENLABS_AGENT_ID=kRdQVspuGMQWp8QZ3Jnp
```

## 🚀 **Mejoras Implementadas**

### Keep-Alive Automático:
- Envía `user_activity` cada 30 segundos
- Previene desconexión automática por timeout

### Retry con Timeout:
- Espera hasta 5 segundos para que el puppet esté listo
- Intenta hasta 10 veces antes de fallar

### Control de Estados:
- Verificación de estado antes de inicializar
- Cleanup completo al cerrar
- Reset de todos los estados

### Botones de Emergencia:
- Restart: Reinicia la conversación
- Force Close: Cierre de emergencia
- Control granular de cada sistema

## 🎯 **Resultado Esperado**

Después de las correcciones, deberías ver:
1. ✅ Una sola sesión de HeyGen
2. ✅ ElevenLabs conectado y estable
3. ✅ Avatar responde a las respuestas de ElevenLabs
4. ✅ Control completo sobre inicio/cierre
5. ✅ No más avatares colgados

¡Si sigues teniendo problemas, usa el botón "Force Close" y luego "Restart"! 🎉 