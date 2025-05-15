# GameCraft2025 - Competencia Universitaria de Desarrollo de Videojuegos

Plataforma web para la gestión y evaluación de GameCraft2025, la competencia universitaria de desarrollo de videojuegos con temáticas chilenas. Desarrollada con Nuxt 3 y Firebase como backend serverless.

## Concepto

GameCraft2025 fusiona los conceptos de "Game" (juego) y "Craft" (artesanía), reflejando la esencia de nuestra competencia: el desarrollo de videojuegos como una forma de artesanía digital que combina habilidad técnica, creatividad y pasión. Como artesanos digitales, los participantes crean experiencias interactivas únicas que exploran y celebran la riqueza cultural, histórica, geográfica y natural de Chile.

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
- **Temáticas Chilenas**: Exploración y reserva de temáticas para los videojuegos

### Módulo de Temáticas Chilenas

Este módulo permite a los participantes explorar y reservar temáticas chilenas para sus videojuegos:

- **Categorías**: Las temáticas están organizadas en categorías como Fauna, Flora, Mitología, Pueblos Originarios, Geografía, Gastronomía y Tradiciones.
- **Búsqueda y Filtrado**: Interfaz intuitiva con búsqueda por texto y filtrado por categorías.
- **Reserva**: Sistema para que los usuarios autenticados puedan reservar una temática para su videojuego.
- **Estado**: Visualización clara del estado de cada temática (disponible o reservada).

El módulo utiliza Firestore para el almacenamiento de las temáticas y sus metadatos, permitiendo:
- Escalabilidad para manejar cientos de temáticas
- Actualizaciones en tiempo real cuando las temáticas son reservadas
- Filtrado eficiente por categorías y estados

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

## Instrucciones de despliegue con Docker

### Requisitos previos
- Docker instalado en el servidor
- Docker Compose instalado en el servidor
- Archivo `.env` con las variables de entorno necesarias

### Pasos para el despliegue
1. Clonar el repositorio en el servidor:
   ```bash
   git clone <url-del-repositorio>
   cd minijuegos-WEB
   ```

2. Crear un archivo `.env` con las variables de entorno necesarias:
   ```
   FIREBASE_PROJECT_ID=minijuegos-1012b
   FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@minijuegos-1012b.iam.gserviceaccount.com
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   RESEND_API_KEY=re_Ka1aZdkV_5knNdLCvQCXiptfUcqxyZTJ9
   ```

3. Construir y levantar los contenedores:
   ```bash
   docker-compose up -d --build
   ```

4. Verificar que la aplicación esté funcionando:
   ```bash
   curl http://localhost:8080/health
   ```

5. La aplicación estará disponible en:
   ```
   http://localhost:8080
   ```

### Mantenimiento

- Para ver los logs de la aplicación:
  ```bash
  docker-compose logs -f app
  ```

- Para detener la aplicación:
  ```bash
  docker-compose down
  ```

- Para reiniciar la aplicación:
  ```bash
  docker-compose restart app
  ```

- Para actualizar la aplicación con cambios recientes:
  ```bash
  git pull
  docker-compose up -d --build
  ```

## Licencia

Todos los derechos reservados.
