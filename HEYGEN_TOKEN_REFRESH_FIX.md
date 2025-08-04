# 🔐 Fix del Error 401 - HeyGen Token Refresh

## 🎯 **Problema Identificado**

Cuando intentas reiniciar una conversación, HeyGen responde con **error 401 (Unauthorized)** porque cada sesión de streaming requiere un **nuevo token**.

## 🚨 **Causa del Problema**

### **Comportamiento Anterior (❌ Incorrecto):**
```javascript
// Solo obtenía nuevo token si avatarRef no existía
if (!avatarRef.current) {
  token = await fetchAccessToken();
  initAvatar(token);
}
```

### **Problema:**
1. Primera sesión: ✅ Obtiene token nuevo
2. Segunda sesión: ❌ Usa token anterior (expirado)
3. Resultado: **401 Unauthorized**

## ✅ **Solución Implementada**

### **1. Siempre Obtener Token Nuevo**
```javascript
// ALWAYS get a fresh token for each new session
console.log(`⏱️ [${new Date().toISOString()}] HEYGEN_FETCHING_NEW_TOKEN`);
const token = await fetchAccessToken();
console.log(`⏱️ [${new Date().toISOString()}] HEYGEN_TOKEN_OBTAINED`);

// Always reinitialize avatar with fresh token for new session
console.log(`⏱️ [${new Date().toISOString()}] HEYGEN_INITIALIZING_AVATAR`);
initAvatar(token);
```

### **2. Limpiar Avatar Ref al Parar**
```javascript
const stopPuppet = useMemoizedFn(async () => {
  try {
    console.log(`⏱️ [${new Date().toISOString()}] HEYGEN_STOPPING_PUPPET`);
    await stopAvatar();
    
    // Clear avatar ref to force fresh initialization next time
    if (avatarRef.current) {
      avatarRef.current = null;
    }
    
    console.log(`⏱️ [${new Date().toISOString()}] HEYGEN_PUPPET_STOPPED`);
  } catch (error) {
    console.error("❌ Error stopping puppet:", error);
  }
});
```

### **3. Detección Específica de Error 401**
```javascript
} catch (error: any) {
  // Check if it's a 401 error (token expired)
  if (error?.message?.includes('401') || error?.status === 401) {
    console.error(`⏱️ [${new Date().toISOString()}] HEYGEN_SPEAK_ERROR_401: Token expired`);
    console.error(`❌ HeyGen token expired. Need to restart session with fresh token.`);
  } else {
    console.error(`⏱️ [${new Date().toISOString()}] HEYGEN_SPEAK_ERROR`, error);
  }
  
  onError?.(error as Error);
}
```

## 🔄 **Flujo Corregido**

### **Primera Sesión:**
```
1. Usuario: "Comenzar Conversación"
2. HeyGen: Obtiene token nuevo ✅
3. HeyGen: Inicializa avatar ✅
4. Conversación: Funciona ✅
5. Usuario: "Terminar"
6. HeyGen: Limpia avatarRef ✅
```

### **Segunda Sesión:**
```
1. Usuario: "Comenzar Conversación"
2. HeyGen: Obtiene token nuevo ✅ (SIEMPRE)
3. HeyGen: Reinicializa avatar ✅ (SIEMPRE)
4. Conversación: Funciona ✅
5. Sin error 401 ✅
```

## 📊 **Logs de Debugging**

### **Logs Exitosos:**
```
⏱️ [timestamp] HEYGEN_FETCHING_NEW_TOKEN
⏱️ [timestamp] HEYGEN_TOKEN_OBTAINED
⏱️ [timestamp] HEYGEN_INITIALIZING_AVATAR
⏱️ [timestamp] HEYGEN_SPEAK_CALLED: "texto"
⏱️ [timestamp] HEYGEN_SPEAK_COMPLETED: Duration: XXXms
⏱️ [timestamp] HEYGEN_AVATAR_START_TALKING
```

### **Logs de Error 401:**
```
⏱️ [timestamp] HEYGEN_SPEAK_ERROR_401: Token expired
❌ HeyGen token expired. Need to restart session with fresh token.
```

## 🎯 **Puntos Clave**

### **✅ Cambios Implementados:**
1. **Token nuevo SIEMPRE** para cada sesión
2. **Reinicialización completa** del avatar
3. **Limpieza del avatarRef** al parar
4. **Detección específica** de error 401
5. **Logs detallados** para debugging

### **🔧 Comportamiento Nuevo:**
- **Cada "Comenzar Conversación"** obtiene token fresco
- **No reutiliza** tokens anteriores
- **Limpia completamente** la sesión anterior
- **Detecta y reporta** errores 401 claramente

## 🚀 **Resultado Esperado**

### **Antes (❌):**
```
Sesión 1: ✅ Funciona
Sesión 2: ❌ Error 401
Sesión 3: ❌ Error 401
```

### **Después (✅):**
```
Sesión 1: ✅ Funciona
Sesión 2: ✅ Funciona (token nuevo)
Sesión 3: ✅ Funciona (token nuevo)
Sesión N: ✅ Funciona (token nuevo)
```

## 🎉 **Prueba la Solución**

1. **Inicia una conversación** → Debería funcionar
2. **Para la conversación** → Debería limpiar correctamente
3. **Inicia otra conversación** → Debería obtener token nuevo
4. **Observa los logs** → Deberías ver `HEYGEN_FETCHING_NEW_TOKEN`

¡El error 401 ya no debería aparecer al reiniciar conversaciones! 🔐✨