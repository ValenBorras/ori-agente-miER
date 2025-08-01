# Demo Minimalista - Avatar Interactivo HeyGen

## Descripción

Esta es una implementación minimalista del avatar interactivo de HeyGen que cumple exactamente con los requisitos especificados:

### ✅ Funcionalidades Implementadas

#### Funcionalidad Principal
- **Avatar visible inmediatamente**: Se muestra la imagen JUJO.png como preview del avatar al cargar la página
- **Un solo botón "Comenzar Chat"**: Interfaz simplificada con un único botón de acción
- **Botón "Cerrar Sesión"**: Aparece cuando la conversación está activa para terminar la sesión
- **Idioma fijo en español**: Configuración hardcodeada con `language: "es"`
- **Velocidad de habla x1**: Configurada con `rate: 1.0` (velocidad normal)
- **Conversación automática**: Al hacer clic se inicia automáticamente el chat de voz

#### Diseño Visual
- **Imagen de fondo**: gobER-expandida.webp como fondo de toda la página
- **Layout minimalista**: Solo avatar y botón, sin elementos innecesarios
- **Contenedor compacto**: Máximo ancho de `max-w-md` con aspecto cuadrado
- **Sin UI innecesaria**: Eliminados todos los controles adicionales

#### Especificaciones Técnicas
- **SDK de HeyGen**: Utiliza `@heygen/streaming-avatar` v2.0.13
- **Configuración fija**: Idioma español por defecto
- **Manejo de estados**: Cargando → Listo → Conversando
- **Sesión establecida**: Verificación de conexión antes de mostrar botón

## Estructura de Archivos

```
components/
├── MinimalistAvatar.tsx          # Componente principal
├── MinimalistAvatarVideo.tsx     # Video simplificado
└── Button.tsx                    # Botón reutilizable

app/
├── page.tsx                      # Página principal actualizada
└── api/get-access-token/         # Endpoint para tokens

env.example                       # Variables de entorno de ejemplo
```

## Configuración

### Variables de Entorno Requeridas

```env
# Obligatorio
HEYGEN_API_KEY=tu_api_key_de_heygen

# Opcionales (valores por defecto incluidos)
NEXT_PUBLIC_BASE_API_URL=https://api.heygen.com
AVATAR=8f059ad755ff4e62b103f2e3b2f127af
VOICE=cddb6172a34a4f83ae225892c4219d31
KNOWLEDGE=90c73013b52542299a8c08bf723ff707
```

### Configuración Fija del Avatar

```typescript
const FIXED_CONFIG: StartAvatarRequest = {
  quality: AvatarQuality.High,           // Calidad alta
  avatarName: ENV_IDS.AVATAR_ID,        // Avatar por defecto
  knowledgeId: ENV_IDS.KNOWLEDGE_ID,    // Base de conocimiento
  voice: {
    voiceId: ENV_IDS.VOICE_ID,          // Voz por defecto
    rate: 1.0,                          // Velocidad x1 (normal)
    emotion: VoiceEmotion.FRIENDLY,     // Emoción amigable
    model: ElevenLabsModel.eleven_flash_v2_5,
  },
  language: "es",                       // Idioma español fijo
  voiceChatTransport: VoiceChatTransport.WEBSOCKET,
  sttSettings: {
    provider: STTProvider.DEEPGRAM,
  },
};
```

## Flujo de Funcionamiento

### 1. Carga Inicial
```
Página carga → Imagen JUJO.png visible → Botón "Comenzar Chat" disponible
```

### 2. Inicio de Conversación
```
Clic en botón → Obtener token → Inicializar avatar → Iniciar chat de voz → Conversación activa
```

### 3. Estados de la Aplicación
- **INACTIVE**: Imagen JUJO.png + botón "Comenzar Chat"
- **CONNECTING**: Indicador de carga "Conectando..."
- **CONNECTED**: Avatar en vivo + "✓ Conversación activa" + botón "Cerrar Sesión"

## Comportamiento Esperado

### Al Cargar la Página
- ✅ Imagen JUJO.png visible como preview del avatar
- ✅ Botón "Comenzar Chat" disponible y funcional
- ✅ Diseño centrado y compacto

### Al Hacer Clic en "Comenzar Chat"
- ✅ Inicio inmediato de conversación en español
- ✅ Transición suave a avatar en vivo
- ✅ Chat de voz automático activado

### Durante la Conversación
- ✅ Avatar responde en español
- ✅ Velocidad de habla x1 (normal)
- ✅ Indicador de estado "✓ Conversación activa"
- ✅ Botón "Cerrar Sesión" disponible para terminar la conversación

## Diferencias con la Versión Original

| Característica | Versión Original | Demo Minimalista |
|----------------|------------------|------------------|
| Configuración | Múltiples opciones | Fija en español |
| Controles | Múltiples botones | Un solo botón |
| Idioma | Seleccionable | Español fijo |
| Velocidad | Ajustable | x1 fija |
| Diseño | Complejo | Minimalista |
| Tamaño | Grande (900px) | Compacto (max-w-md) |

## Instalación y Ejecución

```bash
# 1. Clonar repositorio
git clone <repository-url>
cd InteractiveAvatarNextJSDemo

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp env.example .env
# Editar .env con tu HEYGEN_API_KEY

# 4. Ejecutar aplicación
npm run dev

# 5. Abrir en navegador
open http://localhost:3000
```

## Solución de Problemas

### Error: "API key is missing"
- Verificar que el archivo `.env` existe
- Confirmar que `HEYGEN_API_KEY` está configurado correctamente

### Error: "Failed to retrieve access token"
- Verificar que la API key de HeyGen es válida
- Confirmar conexión a internet

### Avatar no aparece
- Verificar que los IDs de avatar, voz y conocimiento son válidos
- Revisar la consola del navegador para errores

## Recursos Adicionales

- [Documentación del SDK](https://docs.heygen.com/reference/streaming-avatar-sdk)
- [Interactive Avatar 101](https://help.heygen.com/en/articles/9182113-interactive-avatar-101-your-ultimate-guide)
- [Labs HeyGen](https://labs.heygen.com/interactive-avatar) - Para obtener IDs personalizados 