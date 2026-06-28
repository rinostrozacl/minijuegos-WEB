# Guía de programación agentica — GameCraft2026

Documento principal para agentes de IA (Cursor, etc.) que trabajan en **minijuegos-WEB**.  
Alcance: mapa técnico, flujos críticos, reglas de negocio relevantes al código, convenciones y deuda conocida. **No** sustituye la pauta académica completa (`pautas_de_evaluacion.md`, `/bases`).

---

## 1. Qué es este proyecto

Plataforma web del torneo **GameCraft2026**: estudiantes de Ingeniería en Informática registran cuenta, reservan temática mitológica (30 leyendas), editan ficha del juego, suben build **Unity WebGL**, publican y participan en evaluaciones. Docentes administran cohorte, temáticas, fases del concurso y evaluación entre pares (Etapa 4).

| Concepto en producto | Implementación en código |
|---------------------|--------------------------|
| Juego | Documento Firestore en `themes` con `available: false` |
| Temática libre | `themes` con `available: true` |
| Equipo | Dupla: titular (`reservedById`) + 1 compañero (`teammateUid`) |
| Build jugable | Archivos en `public/games/{themeId}/` + campo `gameWebGLUrl` |
| Portada | Firebase Storage `games/{themeId}/…` |
| Admin | Correo en `allowed-emails` con `type: admin` (**regla acordada**) |

---

## 2. Stack

| Capa | Tecnología |
|------|------------|
| Frontend | Nuxt 3, Vue 3 Composition API, Nuxt UI 3, Tailwind 4 |
| Backend | Nitro (`server/api/*`, `server/utils/*`) |
| Auth | Firebase Authentication (cliente) + Admin SDK (servidor) |
| BD | Cloud Firestore |
| Storage | Firebase Storage (solo assets; **no** builds WebGL) |
| Email | Resend |
| Estado global | Composables + `useState` (Pinia instalado pero **sin stores**) |
| Validación | Zod en APIs; utilidades en composables |

**Idioma:** mensajes al usuario, comentarios nuevos y docs en **español**, salvo convención del archivo.

---

## 3. Despliegue (fuente de verdad)

### Producción actual

```
Git push → GitHub → Coolify (detecta cambio) → build & deploy
DNS → Cloudflare → aplicación en servidor
```

- **No** usar como referencia operativa: `docker-compose.yml`, `apphosting.yaml`, `.github/workflows/deploy.yml` (rama `main2` vs `main`, configs legacy).
- Variables sensibles deben vivir en **Coolify**, no commiteadas. El repo contiene secretos históricos en varios archivos — **no copiar ni re-exponer**; tratar como deuda de seguridad.

### Juegos en itch.io (importación)

Flujo: el estudiante publica HTML5/WebGL en **itch.io** y pega la URL de la página del juego en `/mis-juegos`.

```
Estudiante → itch.io (página pública) → /mis-juegos → Probar enlace → preview iframe → Guardar
           → POST /api/games/import-itch (dryRun) → servidor resuelve embed → Firestore
           → /juegos/[id] iframe con https://itch.io/embed/{id}
```

- Utilidades cliente: `utils/gamePlayUrl.ts` — `resolveGamePlayUrl`, validación itch
- Resolución servidor: `server/utils/itchEmbed.ts` — fetch HTML de la página itch y extrae game ID
- Cliente: `composables/useItchImport.ts` — `testItchUrl`, `saveItchUrl`, `clearItchLink`
- **Firestore:** `gameUrl` = página itch; `gameWebGLUrl` = URL embed para iframe
- Titular y compañero pueden importar (`themeEditorAccess.ts`)
- Builds legacy en `/public/games/` siguen funcionando vía `resolveGamePlayUrl`

---

## 4. Mapa del repositorio

```
minijuegos-WEB/
├── pages/              # Rutas Nuxt (file-based routing)
├── components/         # Vue (layout/, display/, etc.)
├── composables/        # Lógica reutilizable (useAuth, useGames, …)
├── middleware/         # auth.ts, admin.ts
├── layouts/            # default.vue, admin.vue
├── server/
│   ├── api/            # Endpoints Nitro REST
│   ├── utils/          # Lógica servidor (email, peer-eval, themeEditorAccess)
│   ├── data/           # allowed-emails.ts (lista estática)
│   └── plugins/        # firebase-admin
├── plugins/            # Cliente: firebase, auth, logout
├── data/               # themes-gamecraft-2026.json (seed)
├── scripts/            # Operaciones batch (seed, sync emails, limpieza)
├── public/games/       # Builds WebGL servidos estáticamente
├── firestore.rules     # Reglas Firestore (desplegar aparte)
├── storage.rules       # Reglas Storage
├── .agents/            # Contexto IA (esta guía, historial, metadatos)
└── nuxt.config.ts      # Runtime config, Nitro, módulos
```

### Páginas por rol

| Ruta | Auth | Notas |
|------|------|-------|
| `/`, `/juegos`, `/juegos/[id]` | Público (juegos solo si `publicado`) | Ratings 1–5 en ficha |
| `/ingresar`, `/registro` | Público | Gate `isRegistrationEnabled` |
| `/bases`, `/faq`, `/tematicas` | **Login requerido** (intencional) | Solo participantes |
| `/mis-juegos` | UI propia (sin middleware; muestra CTA login) | Edición juego |
| `/evaluacion-juegos/*` | auth | Peer eval Etapa 4 |
| `/admin/*` | admin middleware | Panel docente |

### Composables clave

| Archivo | Responsabilidad |
|---------|-----------------|
| `useAuth.ts` | Sesión Firebase, registro vía API, `isAdmin` (⚠️ inconsistente) |
| `useGames.ts` | CRUD juego/temática, equipo, estados |
| `useGameStatus.ts` | Estados canónicos `borrador` / `en_desarrollo` / `publicado` |
| `useThemes.ts` | Listado/reserva temáticas |
| `useSystemConfig.ts` | `appConfig/systemConfig` en Firestore |
| `useItchImport.ts` | Importar juego desde itch.io vía `/api/games/import-itch` (probar + guardar) |
| `usePeerEvaluations.ts` | Cliente APIs peer-eval con Bearer token |
| `useRatings.ts` | Calificaciones públicas 1–5 |
| `useFirebase.ts` | Allowlist email; fallback a API si permission-denied |

---

## 5. Modelo de datos Firestore

### `themes/{themeId}` — entidad central

Campos habituales:

- Identidad: `id`, `title`, `description`, `tags`, `category`, `image`
- Reserva: `available`, `reservedBy`, `reservedById`, `reservedAt`
- Juego: `gameTitle`, `longDescription`, `instructions`, `gameStatus`, `gameWebGLUrl`, `gameLocalPath`, `gameImage`, `gameImagePath`, `gameUrl`, `repositoryUrl`, `publishedAt`
- Equipo: `teammateEmail`, `teammateUid`, `teammateName`

Estados (`gameStatus`): ver `composables/useGameStatus.ts`. Legacy normalizado: `not_started`, `in_progress`, etc.

### `users/{uid}`

Perfil: `displayName`, `email`, `role`, `emailVerified`, `reservedTheme`, timestamps.

### `allowed-emails/{docId}`

- `docId`: email con `@` → `_` y `.` → `_`
- `email`, `enabled`, `type`: `"admin"` | `"student"`
- **Registro:** solo emails presentes y `enabled: true`
- **Admin canónico:** `type === "admin"` (no inferir solo por dominio)

### `appConfig/systemConfig`

| Campo | Uso actual | Uso deseado |
|-------|------------|-------------|
| `isRegistrationEnabled` | ✅ Bloquea `/registro` | Mantener |
| `isReservationEnabled` | ✅ Bloquea reserva en `/tematicas` | Mantener |
| `currentYear` | Informativo | Mantener |
| `currentPhase` | ⚠️ Solo badge en admin | **Debe bloquear funcionalidades** (pendiente implementar) |

Valores válidos de `currentPhase` (`PhaseIndicator.vue`):

`preparation` · `reservation` · `development` · `submission` · `evaluation` · `announcement` · `finished`

### `peerEvaluations/{evalId}`

Documento + subcolecciones:

- `assignments/{uid}` — juegos asignados por estudiante
- `submissions/{id}` — evaluaciones enviadas

Estados: `borrador` → `generada` → `activa` → `pausada` → `finalizada`.  
Escritura **solo** Admin SDK (APIs Nitro). Escala objetivo: **1–5** (código aún valida 1–7).

### `ratings/{id}`

Evaluación abierta pública; escala 1–5; anti-abuso con fingerprint.

### `verification_codes/{email}`

OTP registro; solo backend.

### `games/{id}` — legacy

Reglas permisivas; **no** usar para lógica nueva. Entidad viva = `themes`.

---

## 6. Roles y permisos

### Regla acordada (objetivo)

| Rol | Criterio |
|-----|----------|
| Estudiante | En `allowed-emails`, `type: student`, `enabled: true` |
| Admin | En `allowed-emails`, `type: admin`, `enabled: true` |

### Inconsistencias actuales (no “arreglar” salvo tarea explícita)

| Ubicación | Comportamiento actual |
|-----------|----------------------|
| `middleware/admin.ts` | Cualquier `@santotomas.cl` |
| `useAuth.isAdmin` | `@santotomas.cl` |
| `firestore.rules` `staffDocenteAuth` | `@santotomas.cl` excluyendo `@alumnos.santotomas.cl` |
| `server/api/admin/add-allowed-email.ts` | Asigna `admin` si email contiene `@santotomas.cl` |

Al implementar admin, **unificar** contra allowlist `type: admin`.

### Firestore rules — resumen

- `allowed-emails`, `appConfig`: lectura pública; escritura denegada cliente
- `themes`: lectura pública; update titular/compañero/reserva inicial/docente
- `peerEvaluations`: lectura docente o propio assignment; escritura solo servidor
- Desplegar: `firebase deploy --only firestore:rules`

---

## 7. Flujos críticos

### 7.1 Registro

1. Cliente valida formato (`utils/registration-email.ts`)
2. `/api/verification/allowed-email` o Firestore → email en allowlist
3. `/api/verification/generate` → OTP por Resend → doc `verification_codes`
4. `/api/verification/verify` → marca verificado
5. `/api/auth/register` (Admin SDK) → Auth user `emailVerified: true` + doc `users`
6. Cliente hace `signIn` automático

Variables: `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, Firebase Admin en servidor.

### 7.2 Reserva de temática

1. `appConfig.isReservationEnabled === true`
2. Usuario autenticado en `/tematicas`
3. Update `themes/{id}`: `available: false`, `reservedById`, etc.
4. Update `users/{uid}.reservedTheme`

### 7.3 Edición y publicación (`/mis-juegos`)

- Titular o compañero editan ficha, portada (Storage), equipo (solo titular invita/quita)
- Publicar requiere: título, descripción, instrucciones, imagen, juego enlazado desde itch.io
- `gameStatus: publicado` → visible en `/juegos` para todos

### 7.4 Importación itch.io

1. Estudiante publica HTML5/WebGL en itch.io y pega la URL de la página en `/mis-juegos`
2. **Probar enlace** → POST `/api/games/import-itch` con `dryRun: true` y `Authorization: Bearer`
3. Servidor valida token + titular/compañero (`themeEditorAccess.ts`)
4. Servidor hace fetch de la página itch y extrae el ID de embed (`server/utils/itchEmbed.ts`)
5. Preview iframe con `playUrl` (`https://itch.io/embed/{id}?dark=true`)
6. **Guardar** → misma API con `dryRun: false` → Firestore: `gameUrl`, `gameWebGLUrl`, `itchGameId`
7. Reproducción: `resolveGamePlayUrl` en `/juegos/[id]` (iframe itch o legacy `/games/...`)

URLs legacy en `/public/games/` se normalizan al leer, sin migración Firestore.

### 7.5 Evaluación entre pares (Etapa 4)

- Admin crea instancia → selecciona juegos reservados → genera asignaciones aleatorias (excluye propio juego y compañero)
- Estudiante: `/evaluacion-juegos` → evalúa criterios (alinear a **1–5**) + comentarios obligatorios
- Sin iframe del juego; enlace a ficha pública
- Reporte visible solo al `finalizar`
- APIs: `server/api/peer-eval/*`, lógica en `server/utils/peerEval*.ts`

### 7.6 Calificaciones públicas

- `useRatings.ts` en `/juegos/[id]`
- Escala 1–5, tracking sesión/fingerprint

---

## 8. APIs Nitro (servidor)

| Prefijo | Uso |
|---------|-----|
| `/api/auth/register` | Alta usuario post-OTP |
| `/api/auth/validate-email` | Validación email |
| `/api/verification/*` | OTP y allowlist |
| `/api/games/import-itch` | Resolver embed itch.io (dryRun) y guardar enlace |
| `/api/games/clear-itch` | Quitar enlace itch.io de un tema |
| `/api/peer-eval/*` | Evaluación entre pares |
| `/api/admin/*` | Allowlist, migraciones |
| `/api/send-email` | Email genérico |
| `/api/health` | Health check |

Autenticación servidor: header `Authorization: Bearer <Firebase idToken>`.

---

## 9. Operaciones batch (agentes)

### Correos permitidos — **usar script, no panel**

1. Editar `server/data/allowed-emails.ts`
2. Sincronizar: `node scripts/sync-allowed-emails-from-ts.mjs`
3. Panel `/admin/correos-permitidos` → reservado para humanos (casos puntuales)

Formato test allowlist: `utils/registration-email.ts` (`REGISTRATION_EMAIL_TEST_ALLOWLIST`).

### Temáticas

- Datos: `data/themes-gamecraft-2026.json`
- Seed: `npm run seed:themes` (opción `--reset-available`)

### Scripts de limpieza (destructivos)

- `scripts/delete-all-users-except-admin.mjs`
- `scripts/delete-all-allowed-emails-except-admin.mjs`

Requieren credencial local `[REDACTED]` — no documentar rutas de keys en historial.

---

## 10. Variables de entorno

Ver `.env.example`. Prefijo público: `NUXT_PUBLIC_FIREBASE_*`.

| Variable | Ámbito |
|----------|--------|
| `NUXT_PUBLIC_FIREBASE_*` | **Build** (cliente en el navegador) |
| `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` | **Runtime** del contenedor (Firebase Admin en servidor) |
| `NUXT_FIREBASE_*` (opcional) | Mismo uso que `FIREBASE_*` en runtime |
| `RESEND_API_KEY`, `RESEND_FROM_EMAIL` | Runtime del contenedor. Producción: `GameCraft2026 <info@codepulse.cl>` (dominio `codepulse.cl` verificado en Resend) |

Diagnóstico tras deploy: `GET /api/health/firebase-admin` → `initialized: true`.

**Nunca** commitear valores reales. Configurar en Coolify.

---

## 11. Convenciones de código

- **Composables:** `useNombre.ts`, camelCase
- **Páginas:** kebab-case en ruta, PascalCase no aplica al archivo
- **Componentes:** PascalCase `.vue`
- **API routes:** kebab-case, verbo HTTP en nombre (`*.post.ts`, `*.get.ts`)
- **UI:** Nuxt UI + Tailwind; tema oscuro por defecto (`colorMode.preference: dark`)
- **Imports:** auto-import Nuxt (no importar `ref`, `computed`, etc.)
- **Cambios mínimos:** no refactorizar fuera del alcance de la tarea
- **Tests:** no hay suite Vitest/Playwright en repo; no inventar infra de tests salvo pedido

---

## 12. Deuda técnica priorizada

| Prioridad | Issue | Acción sugerida |
|-----------|-------|-----------------|
| 🟠 P1 | Peer eval escala 1–7 vs 1–5 | Alinear `peerEvalTypes.ts`, UI y validación |
| 🟠 P1 | Admin por dominio vs allowlist | Unificar middleware, `useAuth`, APIs admin |
| 🟠 P1 | `currentPhase` no bloquea features | Implementar gates (import itch, peer-eval, publicación, etc.) |
| 🟡 P2 | `/acceso-denegado` no existe | Crear página o cambiar redirect |
| 🟡 P2 | Secretos en repo | Rotar keys; mover a Coolify; gitignore keys |
| 🟡 P2 | `.cursor-project-rules.md` obsoleto | Actualizado — ver enlace a esta guía |
| 🟡 P2 | CI workflow rama `main2` | Alinear o eliminar si Coolify reemplaza |
| 🟢 P3 | Pinia sin stores | Eliminar módulo o documentar que no se usa |
| 🟢 P3 | `configuracion.vue` guarda `currentPhase` sin UI | Añadir selector de fase o quitar del form |

---

## 13. Antipatrones (evitar)

1. Crear colección `games` nueva — usar `themes`
2. Subir WebGL a Firebase Storage — usar itch.io + `/api/games/import-itch`
3. Escribir `peerEvaluations` desde cliente — solo APIs Nitro
4. Asumir admin por `@santotomas.cl` — consultar `allowed-emails.type`
5. Editar allowlist solo en Firestore sin sync desde TS — desincronización
6. Confiar en `docker-compose.yml` del repo para prod — usar Coolify
7. Ampliar scope: páginas test (`test-ui`, `test-tailwind`, `diagnostico`) son auxiliares
8. Commitear secretos o keys JSON de Firebase

---

## 14. Checklists para agentes

### Antes de empezar una tarea

- [ ] Leer `.agents/context/historial.md` (últimas entradas)
- [ ] Identificar rol afectado (estudiante / admin / público)
- [ ] Confirmar si toca Firestore rules o solo código app
- [ ] No tocar secretos en archivos tracked

### Importación itch.io

- [x] API `import-itch` con dryRun y persistencia Firestore
- [x] Preview obligatorio en `/mis-juegos` antes de guardar
- [x] `resolveGamePlayUrl` soporta embed itch y builds legacy `/games/`
- [ ] Probar end-to-end en producción con URL itch real tras deploy

### Añadir estudiantes (cohorte)

- [ ] Editar `server/data/allowed-emails.ts`
- [ ] Ejecutar sync script
- [ ] Verificar registro end-to-end en staging

### Cambio peer eval

- [ ] APIs en `server/api/peer-eval/`
- [ ] Tipos en `server/utils/peerEvalTypes.ts` y `utils/peerEval.ts`
- [ ] UI admin: `pages/admin/evaluaciones-pares.vue`
- [ ] UI estudiante: `pages/evaluacion-juegos/`
- [ ] Escala 1–5

### Deploy / config

- [ ] Variables en Coolify, no en repo
- [ ] `firebase deploy --only firestore:rules` si cambian reglas
- [ ] Persistencia de `public/games` en volumen del servidor

### Tras cambio grande

- [ ] Entrada en `.agents/context/historial.md`
- [ ] Actualizar esta guía si cambia arquitectura o flujo canónico

---

## 15. Etiquetas de contexto

Usar en historial y commits descriptivos:

`#auth` · `#games` · `#upload` · `#eval` · `#peer-eval` · `#admin` · `#ui` · `#config` · `#deploy` · `#bug` · `#feature` · `#refactor` · `#docs`

---

## 16. Referencias cruzadas

| Documento | Contenido |
|-----------|-----------|
| `README.md` | Upload HTTPS, Docker legacy, URLs |
| `pautas_de_evaluacion.md` | Etapas y rúbricas 1–5 |
| `DOCKER_SETUP.md` | Volúmenes (referencia legacy) |
| `.agents/context/historial.md` | Decisiones y cambios recientes |
| `.agents/README.md` | Índice carpeta IA |
| `.cursor-project-rules.md` | Puntero corto a esta guía |

---

## 17. Fases del concurso ↔ plataforma (orientativo)

| Fase `currentPhase` | Calendario ref. | Funcionalidad plataforma |
|---------------------|-----------------|--------------------------|
| `preparation` | Etapa 0 | Info, registro |
| `reservation` | Selección temática | Reserva en `/tematicas` |
| `development` | Etapas 1–3 | Ficha, portada; enlace itch.io |
| `submission` | Entregables | Importación/publicación itch.io |
| `evaluation` | Etapa 4–5 | Peer eval + ratings públicos |
| `announcement` / `finished` | Cierre | Solo lectura / resultados |

**Estado implementación:** solo `isRegistrationEnabled` e `isReservationEnabled` bloquean. El resto es **diseño pendiente** — implementar cuando se pida explícitamente.

---

*Última actualización: 2026-06-20 — generada tras análisis del repo y validación con el equipo.*
