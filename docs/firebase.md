# Firebase — GameCraft2026

## Proyecto

| Campo | Valor |
|-------|-------|
| Project ID | `minijuegos-1012b` |
| Config local | `.firebaserc` |
| Reglas Firestore | `firestore.rules` |
| Reglas Storage | `storage.rules` |

## Credenciales

### Cliente (público, en build)

Variables con prefijo `NUXT_PUBLIC_FIREBASE_*`. Ver [`.env.example`](../.env.example).

### Servidor (Admin SDK, runtime)

En producción (Coolify), preferir:

```
FIREBASE_SERVICE_ACCOUNT_JSON_BASE64=<base64 del JSON de cuenta de servicio>
```

Alternativas documentadas en `.env.example`. **No** commitear el JSON de cuenta de servicio.

Diagnóstico: `GET /api/health/firebase-admin` → `{ initialized: true }`.

## Colecciones Firestore

### `themes/{themeId}` — entidad central

| Grupo | Campos |
|-------|--------|
| Identidad | `id`, `title`, `description`, `tags`, `category`, `image` |
| Reserva | `available`, `reservedBy`, `reservedById`, `reservedAt` |
| Juego | `gameTitle`, `longDescription`, `instructions`, `gameStatus`, `gameWebGLUrl`, `gameCanvasWidth`, `gameCanvasHeight`, `gameFrameExtraHeight`, `gameImage`, `gameUrl`, `repositoryUrl`, `publishedAt` |
| Equipo | `teammateEmail`, `teammateUid`, `teammateName` |
| Legacy | `gameLocalPath`, `itchGameId`, `gameFilesCount` (pueden existir en docs antiguos) |

Estados `gameStatus`: `borrador` · `en_desarrollo` · `publicado` (ver `composables/useGameStatus.ts`).

### `users/{uid}`

Perfil: `displayName`, `email`, `role`, `emailVerified`, `reservedTheme`, timestamps.

### `allowed-emails/{docId}`

- `docId`: email con `@` → `_` y `.` → `_`
- Campos: `email`, `enabled`, `type` (`admin` | `student`)
- Registro solo si email presente y `enabled: true`

### `appConfig/systemConfig`

| Campo | Uso |
|-------|-----|
| `isRegistrationEnabled` | Bloquea `/registro` |
| `isReservationEnabled` | Bloquea reserva en `/tematicas` |
| `currentYear` | Informativo |
| `currentPhase` | Badge admin; gates por fase pendientes |

### `peerEvaluations/{evalId}`

Subcolecciones: `assignments/{uid}`, `submissions/{id}`. Escritura **solo** Admin SDK.

### `finalEvalRatings/{email}_{gameId}`

Evaluación final (4 criterios 1–5). Escritura solo Admin SDK.

### `ratings/{id}` — legacy (sin uso)

Reemplazado por evaluación final. Solo lectura histórica.

### `verification_codes/{email}`

OTP registro; solo backend.

### Evaluación final

| Colección | Uso |
|-----------|-----|
| `finalEvalConfig/system` | Estado (`cerrada`/`abierta`/`finalizada`), texto intro |
| `finalEvalAllowedEmails/{docId}` | Evaluadores autorizados |
| `finalEvalOtp/{email}` | OTP evaluación final |
| `finalEvalSessions/{sessionId}` | Sesión post-OTP (24 h) |
| `finalEvalRatings/{email}_{gameId}` | Votos (4 criterios 1–5) |

### `games/{id}` — legacy

No usar para lógica nueva.

## Firebase Storage

Ruta típica de portadas: `games/{themeId}/…`

**No** almacenar builds WebGL aquí — usar GitHub Pages.

## Reglas Firestore (resumen)

| Colección | Lectura | Escritura cliente |
|-----------|---------|-------------------|
| `allowed-emails` | Pública | Denegada |
| `appConfig` | Pública | Denegada |
| `themes` | Pública | Titular, compañero, reserva inicial, docente |
| `users` | Autenticado | Propio uid |
| `ratings` | Pública | Denegada (legacy) |
| `peerEvaluations` | Docente o propio assignment | Denegada |
| `verification_codes` | Denegada | Denegada |

Desplegar reglas:

```bash
firebase deploy --only firestore:rules
```

## Operaciones batch (scripts)

| Script | Uso |
|--------|-----|
| `npm run seed:themes` | Cargar temáticas desde `data/themes-gamecraft-2026.json` |
| `node scripts/sync-allowed-emails-from-ts.mjs` | Sincronizar allowlist desde TS |
| `scripts/delete-all-users-except-admin.mjs` | ⚠️ Destructivo |
| `scripts/delete-all-allowed-emails-except-admin.mjs` | ⚠️ Destructivo |

## MCP Firebase

Para consultas y modificaciones desde agentes Cursor, ver [mcp-firebase.md](./mcp-firebase.md).

## Antipatrones

1. Escribir `peerEvaluations` desde cliente
2. Subir WebGL a Storage
3. Crear docs en colección `games`
4. Editar allowlist solo en consola sin sync desde TS
