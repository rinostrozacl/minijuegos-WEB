# Arquitectura Técnica: Plataforma Web de Competencia de Minijuegos

Este documento describe la arquitectura técnica de la plataforma web para la competencia de minijuegos con temáticas chilenas, desarrollada con Nuxt 3 y Firebase.

## Índice

1. [Visión General](#visión-general)
2. [Arquitectura de Aplicación](#arquitectura-de-aplicación)
3. [Estructura de Directorios](#estructura-de-directorios)
4. [Módulos Principales](#módulos-principales)
5. [Integración con Firebase](#integración-con-firebase)
6. [Flujo de Datos](#flujo-de-datos)
7. [Seguridad](#seguridad)
8. [SEO y Rendimiento](#seo-y-rendimiento)

## Visión General

La plataforma está construida como una aplicación web moderna utilizando Nuxt 3, que proporciona renderizado universal (SSR/SSG) combinado con una experiencia de aplicación de una sola página (SPA). El backend se basa en Firebase para proporcionar autenticación, almacenamiento y base de datos en tiempo real.

### Stack Tecnológico

- **Framework Frontend**: Nuxt 3 (Vue 3) con Composition API
- **Módulos Oficiales de Nuxt**:
  - **@nuxt/ui**: Framework de UI basado en Tailwind CSS para interfaces consistentes
  - **@nuxt/image**: Sistema avanzado de optimización y manejo de imágenes
  - **@nuxt/icon**: Gestión de iconos y assets vectoriales
  - **@nuxt/fonts**: Optimización y carga eficiente de fuentes
  - **@nuxt/eslint**: Integración de linting para mantener calidad de código
- **State Management**: Pinia
- **Backend/Servicios**:
  - Firebase Authentication
  - Firebase Firestore (base de datos NoSQL)
  - Firebase Storage (almacenamiento de archivos)
  - Firebase Cloud Functions (funciones serverless)
- **Servicios Adicionales**:
  - Resend Email API (notificaciones por correo)

## Arquitectura de Aplicación

La arquitectura se basa en los principios de Nuxt 3, que utiliza un enfoque de organización por convenciones y directorios. La aplicación sigue un patrón híbrido:

1. **Renderizado del Lado del Servidor (SSR)** para páginas públicas y SEO
2. **Funcionamiento SPA** para la experiencia de usuario una vez cargada
3. **Acceso a API** mediante endpoints serverless de Firebase y Nuxt Server Routes

### Diagrama de Alto Nivel

```
Usuario <-> Nuxt App (SSR/CSR) <-> Firebase Services
                  ^
                  |
                  v
           Nuxt Server Routes
```

## Estructura de Directorios

La estructura de directorios sigue las convenciones de Nuxt 3:

```
app/
├── .nuxt/                     # Compilación automática de Nuxt
├── assets/                    # Recursos estáticos (procesados por Webpack)
├── components/                # Componentes Vue reutilizables
│   ├── auth/                  # Componentes de autenticación
│   ├── games/                 # Componentes relacionados con juegos
│   ├── evaluation/            # Componentes de evaluación
│   └── ui/                    # Componentes de interfaz genéricos
│
├── composables/               # Composables Vue (Composition API)
│   ├── useAuth.ts             # Lógica de autenticación
│   ├── useFirestore.ts        # Operaciones con Firestore
│   └── useStorage.ts          # Operaciones con Storage
│
├── content/                   # Contenido en Markdown/JSON (opcional)
│
├── layouts/                   # Layouts reutilizables
│   ├── default.vue
│   ├── admin.vue
│   └── game.vue
│
├── middleware/                # Middleware de navegación
│   ├── auth.ts                # Middleware de autenticación
│   └── admin.ts               # Middleware para rutas admin
│
├── pages/                     # Páginas (generan rutas automáticamente)
│   ├── index.vue              # Página principal
│   ├── login.vue              # Página de inicio de sesión
│   ├── register.vue           # Página de registro
│   ├── games/                 # Páginas relacionadas con juegos
│   ├── evaluation/            # Páginas de evaluación
│   └── admin/                 # Páginas de administración
│
├── plugins/                   # Plugins de Nuxt
│   ├── firebase.ts            # Configuración de Firebase
│   └── i18n.ts                # Internacionalización (opcional)
│
├── public/                    # Archivos estáticos públicos
│
├── server/                    # API y middleware del servidor (opcional)
│   ├── api/                   # Endpoints de API
│   └── middleware/            # Middleware del servidor
│
├── stores/                    # Almacenes Pinia para gestión de estado
│   ├── auth.ts                # Estado de autenticación
│   ├── games.ts               # Estado de juegos
│   └── evaluation.ts          # Estado de evaluaciones
│
├── types/                     # Definiciones de tipos TypeScript
│
├── utils/                     # Utilidades y funciones auxiliares
│
├── .env                       # Variables de entorno
├── app.vue                    # Entrada principal de la aplicación
├── nuxt.config.ts             # Configuración de Nuxt
└── tsconfig.json              # Configuración de TypeScript
```

### Configuración de Nuxt

La configuración principal del proyecto se encuentra en el archivo `nuxt.config.ts`:

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: [
    "@nuxt/ui",
    "@nuxt/image",
    "@nuxt/icon",
    "@nuxt/fonts",
    "@nuxt/eslint",
  ],

  // Configuración de UI
  ui: {
    // Configuración personalizada de temas
    icons: ["heroicons", "simple-icons"],
  },

  // Configuración de imágenes
  image: {
    provider: "ipx",
    quality: 80,
    screens: {
      xs: 320,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      xxl: 1536,
    },
  },

  // Configuración de ESLint
  eslint: {
    lintOnStart: false,
  },

  // Configuración de fuentes
  fonts: {
    families: [
      {
        name: "Roboto",
        weights: [400, 500, 700],
      },
    ],
  },

  // Variables de entorno públicas
  runtimeConfig: {
    public: {
      firebaseApiKey: "",
      firebaseProjectId: "",
    },
  },
});
```

## Módulos Principales

### 1. Autenticación

- Registro de usuarios con correo institucional
- Inicio de sesión
- Verificación de correo electrónico
- Gestión de roles (participante, evaluador, administrador)

**Implementación**: Utiliza Firebase Authentication con un composable personalizado (`useAuth`) para gestionar el estado de autenticación.

### 2. Gestión de Juegos

- Subida de juegos WebGL
- Gestión de metadatos del juego
- Visualización y ejecución de juegos

**Implementación**: Utiliza Firebase Storage para almacenar archivos de juegos y Firestore para metadatos.

### 3. Evaluación

- Sistema de evaluación basado en criterios
- Cálculo de promedios
- Prevención de evaluaciones duplicadas

**Implementación**: Modelo de datos en Firestore con reglas de seguridad para control de acceso.

### 4. Administración

- Panel de administración
- Gestión de usuarios y temáticas
- Configuración de la competencia

**Implementación**: Páginas protegidas con middleware de autorización y componentes específicos.

## Integración con Firebase

La integración con Firebase se realiza a través de un plugin de Nuxt y composables dedicados:

```typescript
// plugins/firebase.ts
import { defineNuxtPlugin } from "#app";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

export default defineNuxtPlugin((nuxtApp) => {
  const config = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
    measurementId: process.env.FIREBASE_MEASUREMENT_ID,
  };

  const app = initializeApp(config);
  const auth = getAuth(app);
  const firestore = getFirestore(app);
  const storage = getStorage(app);

  nuxtApp.provide("firebase", { app, auth, firestore, storage });
});
```

## Flujo de Datos

### Modelo de Datos

El sistema utiliza Firestore como base de datos principal, con la siguiente estructura:

```
firestore/
├── users/                      # Colección de usuarios
│   └── {userId}/               # Documento de usuario individual
│       ├── profile             # Datos del perfil
│       └── preferences         # Preferencias del usuario
│
├── themes/                     # Colección de temáticas
│   └── {themeId}/              # Documento de temática individual
│       ├── name                # Nombre de la temática
│       ├── description         # Descripción
│       └── assignedTo          # ID del usuario/grupo asignado
│
├── games/                      # Colección de juegos
│   └── {gameId}/               # Documento de juego individual
│       ├── title               # Título del juego
│       ├── description         # Descripción
│       ├── themeId             # ID de la temática
│       ├── createdBy           # ID del creador
│       ├── status              # Estado (borrador, revisión, publicado)
│       ├── gameUrl             # URL del juego en Storage
│       ├── thumbnailUrl        # URL de la imagen de portada
│       └── averageRating       # Calificación promedio
│
└── evaluations/                # Colección de evaluaciones
    └── {evaluationId}/         # Documento de evaluación individual
        ├── gameId              # ID del juego evaluado
        ├── evaluatorId         # ID del evaluador
        ├── criteria            # Objeto con criterios de evaluación
        ├── comments            # Comentarios
        └── timestamp           # Fecha y hora de evaluación
```

### Flujo de Autenticación

1. El usuario ingresa credenciales
2. Firebase Authentication verifica las credenciales
3. Se crea o actualiza la sesión del usuario
4. El estado de autenticación se actualiza en el store de Pinia
5. Se aplican permisos basados en roles

## Seguridad

### Reglas de Seguridad de Firestore

```
service cloud.firestore {
  match /databases/{database}/documents {
    // Reglas para usuarios
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }

    // Reglas para juegos
    match /games/{gameId} {
      allow read: if true;  // Lectura pública
      allow create: if request.auth != null;
      allow update, delete: if request.auth.uid == resource.data.createdBy
                         || request.auth.token.admin == true;
    }

    // Reglas para evaluaciones
    match /evaluations/{evaluationId} {
      allow read: if true;
      allow create: if request.auth != null
                 && !exists(/databases/$(database)/documents/evaluations/
                    query(where "gameId", "==", request.resource.data.gameId)
                    .where("evaluatorId", "==", request.auth.uid));
      allow update, delete: if request.auth.uid == resource.data.evaluatorId
                         || request.auth.token.admin == true;
    }
  }
}
```

## SEO y Rendimiento

### Optimización SEO

- Uso de meta tags dinámicos con `useHead` de Nuxt
- Renderizado del lado del servidor (SSR) para páginas públicas
- Sitemap generado automáticamente
- Uso de URLs amigables

### Estrategias de Rendimiento

- Carga diferida de componentes con `defineAsyncComponent`
- Optimización de imágenes con `@nuxt/image`
- Prefetching inteligente de enlaces
- Caching de datos de Firebase
- Optimización de fuentes con `@nuxt/fonts`
- Integración de iconos optimizados con `@nuxt/icon`

---

Este documento proporciona una visión general de la arquitectura. Para detalles específicos de implementación, consulte la documentación en la carpeta **modulos/**.
