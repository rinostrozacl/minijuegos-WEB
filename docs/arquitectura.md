# Arquitectura — GameCraft2026

## Vista general

```
┌─────────────────────────────────────────────────────────────┐
│  Cliente (Nuxt 3 / Vue 3)                                   │
│  pages/ · components/ · composables/ · plugins/             │
└──────────────────────────┬──────────────────────────────────┘
                           │ Firebase SDK (Auth, Firestore, Storage)
                           │ $fetch → /api/*
┌──────────────────────────▼──────────────────────────────────┐
│  Servidor (Nitro)                                           │
│  server/api/* · server/utils/* · server/plugins/            │
└──────────────────────────┬──────────────────────────────────┘
                           │ Firebase Admin SDK
┌──────────────────────────▼──────────────────────────────────┐
│  Firebase (proyecto minijuegos-1012b)                       │
│  Auth · Firestore · Storage                                 │
└─────────────────────────────────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│  Servicios externos                                         │
│  Resend (email) · GitHub Pages (builds WebGL) · itch.io     │
└─────────────────────────────────────────────────────────────┘
```

## Stack

| Capa | Tecnología |
|------|------------|
| Frontend | Nuxt 3, Vue 3 Composition API, Nuxt UI 3, Tailwind 4 |
| Backend | Nitro (`server/api/*`, preset `node-server`) |
| Auth | Firebase Authentication (cliente) + Admin SDK (servidor) |
| Base de datos | Cloud Firestore |
| Storage | Firebase Storage (portadas; no builds WebGL) |
| Email | Resend |
| Estado global | Composables + `useState` (Pinia instalado, sin stores activos) |
| Validación | Zod en APIs |

## Mapa de carpetas

```
minijuegos-WEB/
├── pages/              # Rutas Nuxt (file-based routing)
├── components/         # Vue (layout/, display/, etc.)
├── composables/        # Lógica reutilizable
├── middleware/         # auth.ts, admin.ts
├── layouts/            # default.vue, admin.vue
├── plugins/            # Cliente: firebase, auth, logout (orden numérico)
├── server/
│   ├── api/            # Endpoints REST Nitro
│   ├── utils/          # Lógica servidor
│   ├── data/           # allowed-emails.ts (lista estática)
│   └── plugins/        # firebase-admin
├── data/               # themes-gamecraft-2026.json (seed temáticas)
├── scripts/            # Operaciones batch
├── public/games/       # Builds legacy servidos estáticamente
├── utils/              # Utilidades compartidas (gamePlayUrl, peerEval, etc.)
├── docs/               # Documentación estructurada
├── .agents/            # Contexto para agentes IA
├── firestore.rules     # Reglas Firestore (desplegar aparte)
├── storage.rules       # Reglas Storage
└── nuxt.config.ts      # Runtime config, Nitro, módulos
```

## Rutas por rol

| Ruta | Auth | Notas |
|------|------|-------|
| `/`, `/juegos`, `/juegos/[id]` | Público | Juegos solo si `publicado` |
| `/ingresar`, `/registro` | Público | Gate `isRegistrationEnabled` |
| `/bases`, `/faq`, `/tematicas` | Login requerido | Intencional |
| `/mis-juegos` | UI propia | Edición juego (CTA login si no autenticado) |
| `/evaluacion-juegos/*` | auth middleware | Peer eval Etapa 4 |
| `/admin/*` | admin middleware | Panel docente |

## Composables clave

| Archivo | Responsabilidad |
|---------|-----------------|
| `useAuth.ts` | Sesión Firebase, registro vía API, `isAdmin` |
| `useGames.ts` | CRUD juego/temática, equipo, estados |
| `useGameStatus.ts` | Estados `borrador` / `en_desarrollo` / `publicado` |
| `useThemes.ts` | Listado/reserva temáticas |
| `useSystemConfig.ts` | `appConfig/systemConfig` en Firestore |
| `useGithubPagesImport.ts` | Importar juego desde GitHub Pages |
| `useItchImport.ts` | Legacy: import itch (sustituido por Pages como fuente principal) |
| `usePeerEvaluations.ts` | Cliente APIs peer-eval |
| `useRatings.ts` | Calificaciones públicas 1–5 |
| `useFirestore.ts` | Acceso Firestore cliente |

## Reproducción de juegos

Utilidad central: `utils/gamePlayUrl.ts`

| Fuente | Campo Firestore | Comportamiento |
|--------|-----------------|----------------|
| GitHub Pages | `gameWebGLUrl` | iframe directo a `*.github.io` |
| itch.io embed | `gameWebGLUrl` + `itchGameId` | Legacy; iframe embed |
| Build local legacy | `/games/{themeId}/` | Servido desde `public/games/` |
| itch.io anexo | `gameUrl` | Solo enlace en ficha, no reproducción |

## Autenticación servidor

Todas las APIs protegidas esperan:

```
Authorization: Bearer <Firebase idToken>
```

Utilidades: `server/utils/firebaseAuth.ts`, `server/utils/themeEditorAccess.ts`.

## Middleware

| Archivo | Comportamiento |
|---------|----------------|
| `middleware/auth.ts` | Requiere sesión Firebase |
| `middleware/admin.ts` | Requiere `@santotomas.cl` (⚠️ inconsistente con allowlist) |

## Plugins (orden de carga)

1. `plugins/1.firebase.client.ts` — Inicializa Firebase SDK
2. `plugins/2.auth.client.ts` — Estado de autenticación
3. `plugins/3.logout.client.ts` — Limpieza al cerrar sesión

## Referencias

- [firebase.md](./firebase.md) — modelo de datos
- [apis.md](./apis.md) — endpoints
- [../.agents/guia-agentica.md](../.agents/guia-agentica.md) — flujos y deuda técnica
