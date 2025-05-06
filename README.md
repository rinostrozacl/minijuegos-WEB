# EVA Videojuegos - Plataforma Web para Competencia de Minijuegos

Plataforma web para la gestión y evaluación de una competencia de minijuegos con temáticas chilenas. Desarrollada con Nuxt 3 y Firebase como backend serverless.

## Estructura del Proyecto

El proyecto está organizado en dos directorios principales:

- **Plataforma Web/**: Contiene toda la aplicación web Nuxt 3 y su documentación
  - **app/**: Aplicación Nuxt 3 (frontend)
  - **docs/**: Documentación técnica y de requerimientos

## Tecnologías Utilizadas

- **Frontend**: Nuxt 3 con Vue 3 (Composition API)
- **UI Framework**: Nuxt UI / Tailwind CSS
- **Backend**: Firebase (Firestore, Authentication, Storage, Cloud Functions)
- **Email**: Resend Email Service para notificaciones

### Módulos de Nuxt Instalados

- **@nuxt/ui**: Framework de interfaz de usuario basado en Tailwind CSS
- **@nuxt/image**: Sistema de optimización de imágenes
- **@nuxt/icon**: Soporte para iconos y SVG
- **@nuxt/fonts**: Gestión y optimización de fuentes
- **@nuxt/eslint**: Integración de ESLint para Nuxt 3

## Módulos Principales

La aplicación está organizada en módulos funcionales:

- **Autenticación**: Registro, inicio de sesión y verificación de correo
- **Gestión de Juegos**: Subida, listado y visualización de juegos
- **Evaluación**: Sistema para evaluar los juegos participantes
- **Administración**: Panel para gestión de la competencia
- **Preregistro**: Funcionalidad para inscripción masiva de participantes
- **Perfil de Usuario**: Gestión de datos personales

## Cómo Comenzar

### Requisitos Previos

- Node.js (v18 o superior)
- pnpm (recomendado) o npm
- Cuenta de Firebase (con Blaze plan para Cloud Functions)

### Instalación

1. Clonar el repositorio
2. Navegar al directorio de la aplicación
   ```
   cd "EVA Videojuegos/Plataforma Web/app"
   ```
3. Instalar dependencias
   ```
   pnpm install
   ```
4. Configurar Firebase
   - Crear proyecto en Firebase Console
   - Habilitar Authentication, Firestore y Storage
   - Configurar las variables de entorno en `.env`

### Ejecución en Modo Desarrollo

```
pnpm dev
```

La aplicación estará disponible en `http://localhost:3000/`.

### Compilación para Producción

```
pnpm build
```

Los archivos compilados se encontrarán en el directorio `.output/`.

## Documentación

La documentación completa del proyecto se encuentra en el directorio `/docs`:

- **Requerimientos**: Especificación funcional y casos de uso
- **Implementación**: Arquitectura, configuración y guías de desarrollo
- **Módulos**: Documentación detallada de cada módulo funcional

## Despliegue

La aplicación está diseñada para ser desplegada en Firebase Hosting:

```
firebase deploy
```

Para despliegues serverless completos también se recomienda Vercel o Netlify.

## Licencia

Todos los derechos reservados.
