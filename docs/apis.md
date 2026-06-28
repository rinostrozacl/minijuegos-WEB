# APIs Nitro — GameCraft2026

Base URL: mismo origen de la app (`/api/*`). Autenticación: header `Authorization: Bearer <Firebase idToken>` salvo endpoints públicos.

## Health

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/api/health` | No | Health check general |
| GET | `/api/health/firebase-admin` | No | Estado Firebase Admin SDK |

## Autenticación y registro

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/api/auth/register` | No | Alta usuario post-OTP (Admin SDK) |
| POST | `/api/auth/validate-email` | No | Validación formato email |

## Verificación (OTP)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET/POST | `/api/verification/allowed-email` | No | Verificar email en allowlist |
| POST | `/api/verification/generate` | No | Generar y enviar OTP |
| POST | `/api/verification/verify` | No | Verificar código OTP |

## Juegos

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/api/games/import-github-pages` | Bearer | Validar/guardar URL GitHub Pages |
| POST | `/api/games/import-itch` | Bearer | Legacy: resolver embed itch.io |
| POST | `/api/games/clear-itch` | Bearer | Legacy: quitar enlace itch |
| GET | `/api/games/test` | No | Test endpoint |

### POST `/api/games/import-github-pages`

Body:

```json
{
  "themeId": "mapuche-001",
  "playUrl": "https://usuario.github.io/repo/",
  "dryRun": true
}
```

- `dryRun: true` — valida URL y devuelve dimensiones canvas sin persistir
- `dryRun: false` — guarda en Firestore (`gameWebGLUrl`, dimensiones, limpia campos legacy)
- Requiere ser titular o compañero del tema (`themeEditorAccess.ts`)

Respuesta exitosa:

```json
{
  "success": true,
  "playUrl": "https://usuario.github.io/repo/",
  "canvasWidth": 960,
  "canvasHeight": 600,
  "frameExtraHeight": 0,
  "saved": false
}
```

## Evaluación entre pares

Prefijo: `/api/peer-eval/`

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/api/peer-eval/create` | Admin | Crear instancia evaluación |
| POST | `/api/peer-eval/generate` | Admin | Generar asignaciones |
| POST | `/api/peer-eval/start` | Admin | Activar evaluación |
| POST | `/api/peer-eval/update` | Admin | Actualizar evaluación |
| POST | `/api/peer-eval/finalize` | Admin | Finalizar evaluación |
| POST | `/api/peer-eval/cancel` | Admin | Cancelar evaluación |
| POST | `/api/peer-eval/reset` | Admin | Reset evaluación |
| POST | `/api/peer-eval/set-intake` | Admin | Configurar intake |
| POST | `/api/peer-eval/submit` | Estudiante | Enviar evaluación |
| GET | `/api/peer-eval/list` | Admin | Listar evaluaciones |
| GET | `/api/peer-eval/my-assignments` | Estudiante | Asignaciones propias |
| GET | `/api/peer-eval/reserved-games` | Admin | Juegos reservados |
| GET | `/api/peer-eval/report` | Admin | Reporte (post-finalize/activa) |

Lógica: `server/utils/peerEvalService.ts`, tipos en `server/utils/peerEvalTypes.ts`.

## Evaluación final

Prefijo: `/api/final-eval/`

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/status` | No | Estado global (`cerrada`/`abierta`/`finalizada`) |
| GET | `/eligibility` | Opcional Bearer / sesión | ¿Puede evaluar? ¿Skip OTP? |
| POST | `/request-otp` | No | Solicitar OTP (rate limit) |
| POST | `/verify-otp` | No | Verificar OTP → sesión 24h |
| GET | `/check?gameId=` | Sesión o Bearer | ¿Ya votó este juego? |
| GET | `/progress` | Sesión o Bearer | Progreso del evaluador |
| POST | `/submit` | Sesión o Bearer | Enviar 4 criterios |

Admin (`/api/final-eval/admin/`): config, set-status, dashboard, allowed-emails CRUD/bulk, results.

## Admin

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/api/admin/add-allowed-email` | Admin | Añadir email a allowlist |
| POST | `/api/admin/migrate-allowed-emails` | Admin | Migración allowlist |

## Otros

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/api/send-email` | Varía | Envío email genérico |
| GET | `/api/user-info` | Bearer | Info usuario |

## Errores

Formato estándar vía `server/utils/apiError.ts`. Códigos comunes:

| Código | Significado |
|--------|-------------|
| 400 | Parámetros inválidos |
| 401 | Token ausente o inválido |
| 403 | Sin permiso (no titular/compañero/admin) |
| 404 | Recurso no encontrado |
| 405 | Método HTTP incorrecto |

## Referencias

- `server/utils/themeEditorAccess.ts` — permisos titular/compañero
- `server/utils/firebaseAuth.ts` — verificación token
- [arquitectura.md](./arquitectura.md) — composables cliente
