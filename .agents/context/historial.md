## [2026-04-22]

### Proyecto: minijuegos-WEB — alineación contenido GameCraft2026

**Contexto:** Pauta oficial 2026 (torneo Unity, temáticas mitológicas, etapas y rúbricas 1–5).

**Cambios:**
- Marca y metadatos: GameCraft2025 → **GameCraft2026** en UI, correos, `nuxt.config`, scripts Docker, `package.json` / lockfile.
- Contenido público: `index.vue`, `GameCraftConcept.vue`, refactor de `bases.vue` (calendario abril–junio 2026, entregables por etapa, reglas técnicas PDF, premiación por categorías, sin montos obsoletos).
- FAQ, listado de juegos y ficha de juego actualizados a mitología / fechas 2026.
- `tematicas.vue`: copy y filtros por cultura; admin etiquetas acordes.
- Datos: `data/themes-gamecraft-2026.json` con 30 leyendas y script `scripts/seed-themes-2026.mjs` (`npm run seed:themes`); opción `--reset-available` documentada en el script.
- `pautas_de_evaluacion.md` y `README.md` sincronizados con la nueva pauta.

**Decisiones:**
- Premios en web = solo categorías de la pauta (sin montos en efectivo).
- Texto institucional: IP Santo Tomás + mención pie pauta (Dirección Nacional Área Informática) en bases.

**Archivos afectados:** `pages/bases.vue`, `pages/faq.vue`, `pages/tematicas.vue`, `pages/juegos/index.vue`, `pages/juegos/[id].vue`, `components/GameCraftConcept.vue`, `pages/admin/tematicas.vue`, `data/themes-gamecraft-2026.json`, `scripts/seed-themes-2026.mjs`, `pautas_de_evaluacion.md`, `README.md`, múltiples referencias de marca.

`#feature` `#docs` `#config`

---

## [2026-04-22]

### Proyecto: minijuegos-WEB — convención `.agents/`

**Contexto:** Se solicitó mantener convención `.agents/` para contexto e historial de IA en el repositorio.

**Cambios:**
- Creación de la carpeta `.agents/` con `README.md`, `context/historial.md`, `proyectos.json`, `preferencias.json` y `estadisticas.json`.

**Decisiones:**
- El historial de sesiones y decisiones persistentes para IA vive solo en `.agents/context/historial.md` (no `.ia/`).

**Próximos pasos:**
- Tras cambios grandes (arquitectura, deps, flujos): actualizar esta sección y `proyectos.json`; valorar `requerimientos.md` en raíz si se define.

**Archivos afectados:** `.agents/README.md`, `.agents/context/historial.md`, `.agents/proyectos.json`, `.agents/preferencias.json`, `.agents/estadisticas.json`

`#config`

---

## [2026-04-22]

### Proyecto: minijuegos-WEB — limpieza de usuarios (Firebase)

**Contexto:** Renovación de participantes; conservar solo la cuenta de administración acordada (correo `@santotomas.cl` indicado por el equipo).

**Cambios:**
- Eliminados **30** documentos en Firestore, colección `users`; permanece **1** documento (administrador).
- Verificación en Firebase Authentication: **1** usuario total (administrador); en la ejecución del script no había otros usuarios que borrar en Auth (posible alineación previa o cuentas ya inexistentes en Auth).
- Añadido script `scripts/delete-all-users-except-admin.mjs` para operación reproducible con `minijuegos-firebasekey.json` local.

**Decisiones:**
- No tocar en esta tarea colecciones `themes`, `allowed-emails` ni `verification_codes` (solo usuarios según pedido).

**Próximos pasos:**
- Si el concurso 2026 exige tablero limpio: valorar reset de reservas en `themes`, lista `allowed-emails` y códigos en `verification_codes`.

**Archivos afectados:** `scripts/delete-all-users-except-admin.mjs`, Firebase (`users`, Auth)

`#config`

---

## [2026-04-22]

### Proyecto: minijuegos-WEB — `allowed-emails` solo administrador

**Contexto:** Misma renovación de participantes; en Firestore `allowed-emails` solo debe quedar el administrador para cargar nuevos correos después.

**Cambios:**
- Eliminados **31** documentos en `allowed-emails`; queda **1** documento canónico `ricardoinostrozare_santotomas_cl` con `enabled: true`, `type: admin`.
- Script `scripts/delete-all-allowed-emails-except-admin.mjs`.
- Lista estática `server/data/allowed-emails.ts` reducida al mismo correo para no desincronizar migraciones/manuales.

**Archivos afectados:** `scripts/delete-all-allowed-emails-except-admin.mjs`, `server/data/allowed-emails.ts`, Firebase (`allowed-emails`)

`#config`

---

## [2026-04-22]

### Proyecto: minijuegos-WEB — cohorte en `allowed-emails`

**Contexto:** Lista de estudiantes 2026 para permitir registro; correo `D.CATIN@...` normalizado a minúsculas (`d.catin@alumnos.santotomas.cl`).

**Cambios:**
- `server/data/allowed-emails.ts`: administrador + **30** estudiantes.
- Firestore `allowed-emails`: upsert de **31** documentos vía `scripts/sync-allowed-emails-from-ts.mjs`.

**Archivos afectados:** `server/data/allowed-emails.ts`, `scripts/sync-allowed-emails-from-ts.mjs`, Firebase (`allowed-emails`)

`#feature`

---

## [2026-04-22]

### Proyecto: minijuegos-WEB — correo de prueba Gmail

**Contexto:** Permitir `rinostrozareb@gmail.com` como estudiante de prueba además de dominios institucionales.

**Cambios:**
- `utils/registration-email.ts`: allowlist cerrada y `isRegistrationEmailFormatAllowed()`.
- Registro, validación, código de verificación, alta admin, login, recuperación y calificación en juego usan la misma regla; `useValidation` expone `isValidInstitutionalEmail` como alias.
- `allowed-emails` en código y Firestore (32 documentos tras sync); Gmail con `type: student`.
- Script `sync-allowed-emails-from-ts.mjs` actualizado para emails con cualquier dominio en el array y roles coherentes.

**Archivos afectados:** `utils/registration-email.ts`, `server/data/allowed-emails.ts`, varias rutas API y páginas, `scripts/sync-allowed-emails-from-ts.mjs`, Firebase (`allowed-emails`)

`#feature`

---

## [2026-04-22]

### Proyecto: minijuegos-WEB — registro sin Firestore en cliente

**Contexto:** En consola aparecía error al validar correo en el paso 1 del registro porque `$firestore` era `null`; el flujo igual pasaba por `/api/verification/allowed-email`.

**Causa:** `runtimeConfig.public` leía `FIREBASE_API_KEY` (etc.) pero en Docker y `.env.example` las variables son `NUXT_PUBLIC_FIREBASE_*`, así el plugin cliente no inicializaba Firebase.

**Cambios:**
- `nuxt.config.ts`: mapeo público con `NUXT_PUBLIC_FIREBASE_*` y fallback a nombres sin prefijo.
- `composables/useFirebase.ts`: si no hay Firestore en cliente, `console.warn` en lugar de `console.error` y mensaje que indica fallback por API.

**Archivos afectados:** `nuxt.config.ts`, `composables/useFirebase.ts`

`#bug`

---

## [2026-04-22]

### Proyecto: minijuegos-WEB — Firestore `permission-denied` en producción

**Contexto:** Con Firebase cliente bien configurado, fallaban lecturas a `appConfig` y `allowed-emails` con `Missing or insufficient permissions`.

**Causa:** Reglas de seguridad de Firestore en consola Firebase demasiado restrictivas (o por defecto) para lo que el SDK cliente necesita.

**Cambios:**
- `firestore.rules` en el repo + entrada `firestore` en `firebase.json`.
- `useFirebase.isEmailAllowed`: ante `permission-denied`, mismo fallback que `/api/verification/allowed-email`.
- `useAppConfig.loadConfig`: ante `permission-denied`, usa `DEFAULT_CONFIG` y avisa en consola (evita bloquear la app).

**Próximos pasos:** Desplegar reglas en el proyecto Firebase (`firebase deploy --only firestore:rules` o pegar reglas en consola).

**Archivos afectados:** `firestore.rules`, `firebase.json`, `composables/useFirebase.ts`, `composables/useAppConfig.ts`

`#bug`

---

## [2026-04-22]

### Proyecto: minijuegos-WEB — Resend 403 y UI de registro

**Contexto:** Código de verificación no llegaba; Resend devolvía dominio `codepulse.cl` no verificado; la UI avanzaba de paso porque `useFetch` devolvía 200 con `success: false` en el cuerpo.

**Cambios:**
- `RESEND_FROM_EMAIL` en `runtimeConfig`; `server/utils/email.ts` usa remitente configurable o `onboarding@resend.dev` por defecto.
- `composables/useEmail.ts`: interpretar `success` en el JSON de `/api/verification/generate` y `/api/send-email`.
- `generate.post.ts`: borrar documento `verification_codes` si falla el envío; email normalizado a minúsculas.
- `send-email.post.ts`: deja de usar API key en claro; usa `sendServerEmail`.
- `registro.vue`: toast con `result.message` en fallos.

**Archivos afectados:** `nuxt.config.ts`, `.env.example`, `server/utils/email.ts`, `server/api/verification/generate.post.ts`, `server/api/send-email.post.ts`, `composables/useEmail.ts`, `pages/registro.vue`

`#bug`

---

## [2026-04-23]

### Proyecto: minijuegos-WEB — mostrar/ocultar contraseña en registro

**Contexto:** En `/registro` los campos de contraseña solo estaban en modo oculto; se pidió un control tipo “ojo” para ver lo escrito.

**Cambios:**
- `pages/registro.vue`: `showPassword` y `showConfirmPassword`; inputs con `:type` dinámico; botón a la derecha con iconos `i-heroicons-eye` / `i-heroicons-eye-slash`, `aria-label` y `aria-pressed`; padding `pr-11` para no solapar texto con el botón.

**Archivos afectados:** `pages/registro.vue`

`#feature`

---

## [2026-04-23]

### Proyecto: minijuegos-WEB — flujo registro coherente (OTP + sesión + email verificado)

**Contexto:** Tras OTP y alta, la sesión quedaba activa pero se invitaba a `/ingresar` y el header seguía pidiendo “Verificar Email” porque Firebase Auth se creaba con `emailVerified: false` y no se exigía OTP en el API de registro.

**Cambios:**
- `server/api/auth/register.post.ts`: normalización de email; lectura de `verification_codes/{email}` con `isVerified`; sin doc o sin verificar → error; `createUser` con `emailVerified: true` y documento `users` con `emailVerified: true`; email guardado en minúsculas.
- `composables/useAuth.ts`: registro y `signIn` posteriores usan correo normalizado (`emailNorm`).
- `pages/registro.vue`: tras registro con sesión automática, toast y `navigateTo` a `/` o `?redirect=` interno seguro; paso 3 con CTA “Ir al inicio” y “Iniciar sesión” secundario si `navigateTo` falla.
- `pages/ingresar.vue`: tras `waitForAuthInitialized`, si ya hay sesión redirige a `/` o `redirect` seguro; tras login exitoso usa el mismo destino.

**Decisiones:** El OTP por correo equivale a verificación de email para el alta; cuentas antiguas con `emailVerified: false` pueden seguir usando `/verificar-email` con enlace Firebase.

**Archivos afectados:** `server/api/auth/register.post.ts`, `composables/useAuth.ts`, `pages/registro.vue`, `pages/ingresar.vue`

`#feature` `#bug`
