# HeyGen Interactive Avatar NextJS Demo - Versión Minimalista

![HeyGen Interactive Avatar NextJS Demo Screenshot](./public/demo.png)

Esta es una demo minimalista del avatar interactivo de HeyGen con configuración fija en español. El proyecto está construido usando [NextJS](https://nextjs.org/).

## Características de la Demo Minimalista

- ✅ Imagen JUJO.png visible como preview del avatar al cargar la página
- ✅ Un solo botón "Comenzar Chat" 
- ✅ Botón "Cerrar Sesión" cuando la conversación está activa
- ✅ Idioma fijo en español (sin opciones de cambio)
- ✅ Velocidad de habla x1 (normal) configurada por defecto
- ✅ Conversación automática al hacer clic en el botón
- ✅ Diseño minimalista con imagen de fondo gobER-expandida.webp
- ✅ Contenedor compacto y centrado

## Configuración Inicial

### 1. Clonar el repositorio

```bash
git clone <repository-url>
cd InteractiveAvatarNextJSDemo
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Crea un archivo `.env` en la raíz del proyecto basándote en `env.example`:

```bash
cp env.example .env
```

Edita el archivo `.env` y agrega tu API key de HeyGen:

```env
HEYGEN_API_KEY=tu_api_key_de_heygen_aqui
```

**¿Dónde obtener tu API Key?**
- Ve a [https://app.heygen.com/settings?from=&nav=Subscriptions%20%26%20API](https://app.heygen.com/settings?from=&nav=Subscriptions%20%26%20API)
- Copia tu API Key de HeyGen Enterprise

### 4. Ejecutar la aplicación

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000` (o el puerto que Next.js asigne automáticamente)

## Uso de la Demo

1. **Al cargar la página**: Verás la imagen JUJO.png como preview del avatar
2. **Hacer clic en "Comenzar Chat"**: Se iniciará automáticamente la conversación en español
3. **Durante la conversación**: El avatar responderá y hablará en español a velocidad normal
4. **Para terminar**: Haz clic en "Cerrar Sesión" para finalizar la conversación

## Configuración Avanzada (Opcional)

Si quieres personalizar el avatar, voz o conocimiento base, puedes agregar estas variables al archivo `.env`:

```env
# IDs personalizados (opcionales)
AVATAR=tu_avatar_id_aqui
VOICE=tu_voice_id_aqui  
KNOWLEDGE=tu_knowledge_id_aqui
```

**¿Dónde encontrar estos IDs?**
- Ve a [https://labs.heygen.com/interactive-avatar](https://labs.heygen.com/interactive-avatar)
- Selecciona "Select Avatar" para ver los avatares públicos disponibles
- O crea tu propio avatar interactivo con "Create Interactive Avatar"

## Tecnologías Utilizadas

- **Next.js 15** - Framework de React
- **@heygen/streaming-avatar** - SDK oficial de HeyGen
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Estilos y diseño

## Recursos Adicionales

- [Documentación del SDK de HeyGen](https://docs.heygen.com/reference/streaming-avatar-sdk)
- [Interactive Avatar 101](https://help.heygen.com/en/articles/9182113-interactive-avatar-101-your-ultimate-guide) - Guía completa sobre avatares interactivos
- [Discusiones del SDK](https://github.com/HeyGen-Official/StreamingAvatarSDK/discussions) - Soporte y feedback
