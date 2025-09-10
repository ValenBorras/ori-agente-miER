# Ori - Agente de Apoyo en Salud Mental Adolescente

## 🎯 Propósito

**Ori** es una plataforma de chat inteligente diseñada específicamente para brindar apoyo y orientación a **padres y docentes** que se enfrentan a situaciones relacionadas con la salud mental de adolescentes. Nuestro enfoque se centra en el concepto de **"cuidar a los que cuidan"**, reconociendo que quienes están en contacto directo con jóvenes necesitan herramientas y apoyo para manejar estas situaciones complejas.

## 🌟 Características Principales

### Chat Dual Especializado
- **Ori Docentes**: Interfaz específica para educadores que necesitan orientación sobre cómo manejar situaciones de salud mental en el ámbito escolar
- **Ori Padres**: Espacio dedicado para padres y tutores que buscan apoyo para ayudar a sus hijos adolescentes

### Tecnología Avanzada
- **GPT-5**: Utilizamos el modelo de lenguaje más avanzado de OpenAI para proporcionar respuestas contextualizadas y precisas
- **Next.js**: Framework moderno de React para una experiencia de usuario fluida y responsiva
- **Vector Store**: Base de conocimientos especializada en salud mental adolescente para respuestas más precisas

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js 18+ 
- npm o yarn
- Clave API de OpenAI

### Pasos de Instalación

1. **Clonar el repositorio**
   ```bash
   git clone [URL_DEL_REPOSITORIO]
   cd ori-agente-mier
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   ```bash
   cp .env.example .env.local
   ```
   
   Agregar tu clave API de OpenAI:
   ```
   OPENAI_API_KEY=tu_clave_aqui
   ```

4. **Ejecutar en modo desarrollo**
   ```bash
   npm run dev
   ```

5. **Abrir en el navegador**
   ```
   http://localhost:3000
   ```

## 🏗️ Arquitectura Técnica

### Frontend
- **Next.js 15**: Framework React con App Router
- **TypeScript**: Tipado estático para mayor robustez
- **Tailwind CSS**: Estilos utilitarios para diseño responsivo
- **React Markdown**: Renderizado de respuestas con formato

### Backend
- **API Routes**: Endpoints de Next.js para manejo de chat
- **OpenAI Responses API**: Integración con GPT-5 y vector stores
- **Vector Store**: Base de conocimientos especializada

### Componentes Principales
- `Chat.tsx`: Componente principal de chat con funcionalidades completas
- `NavBar.tsx`: Navegación de la aplicación
- `Footer.tsx`: Pie de página con información legal

## 📋 Funcionalidades

### Para Docentes
- Orientación sobre señales de alerta en estudiantes
- Estrategias de comunicación con adolescentes
- Protocolos de derivación a profesionales
- Manejo de crisis en el aula
- Comunicación con padres sobre situaciones sensibles

### Para Padres
- Identificación de cambios de comportamiento
- Estrategias de comunicación familiar
- Cuándo buscar ayuda profesional
- Manejo de situaciones de crisis
- Apoyo emocional para cuidadores

## ⚠️ Disclaimers Legales Importantes

### 🚨 Limitaciones del Servicio

**Ori NO es un servicio de emergencia médica o psicológica.** En caso de crisis o emergencias:

- **Línea Nacional de Prevención del Suicidio**: 988 (España) / 911 (emergencias)
- **Teléfono de la Esperanza**: 717 003 717
- **Emergencias**: 112

### 📋 Descargo de Responsabilidad

1. **No sustituye atención profesional**: Las respuestas de Ori son orientativas y no reemplazan la consulta con profesionales de la salud mental calificados.

2. **Información general**: El contenido proporcionado es de carácter informativo y educativo únicamente.

3. **Responsabilidad del usuario**: Los usuarios son responsables de evaluar la información recibida y tomar decisiones apropiadas basadas en su situación específica.

4. **Confidencialidad**: Aunque implementamos medidas de seguridad, no podemos garantizar la confidencialidad absoluta de las conversaciones.

5. **Precisión de la información**: Aunque utilizamos tecnología avanzada, la información puede no ser siempre precisa o aplicable a todas las situaciones.

### 🔒 Privacidad y Datos

- Las conversaciones pueden ser almacenadas temporalmente para mejorar el servicio
- No compartimos información personal con terceros
- Los datos se procesan según las políticas de privacidad de OpenAI
- Los usuarios pueden solicitar la eliminación de sus datos

### 📜 Cumplimiento Legal

Este servicio cumple con:
- **RGPD** (Reglamento General de Protección de Datos)
- **LOPD-GDD** (Ley Orgánica de Protección de Datos Personales)
- **Normativas de protección de menores**

## 🤝 Contribuciones

### Cómo Contribuir

1. Fork del repositorio
2. Crear una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit de tus cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear un Pull Request

### Áreas de Mejora
- Ampliación de la base de conocimientos
- Mejoras en la interfaz de usuario
- Optimización de respuestas
- Nuevas funcionalidades de apoyo

## 📞 Soporte y Contacto

### Soporte Técnico
- **Email**: soporte@ori-agente.com
- **Issues**: Usar el sistema de issues de GitHub

### Consultas sobre Salud Mental
- **Profesionales**: Contactar con psicólogos o psiquiatras especializados en adolescentes
- **Recursos**: Consultar con centros de salud mental locales

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🙏 Agradecimientos

- **OpenAI** por proporcionar la tecnología GPT-5
- **Next.js** por el framework de desarrollo
- **Comunidad de desarrolladores** por las librerías open source utilizadas
- **Profesionales de salud mental** que contribuyen al conocimiento base

---

**Recuerda**: Ori está aquí para apoyarte, pero siempre busca ayuda profesional cuando sea necesario. Tu bienestar y el de los adolescentes que cuidas es nuestra prioridad.

*Última actualización: Diciembre 2024*
