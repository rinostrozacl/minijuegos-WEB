## [2026-06-20]

### Proyecto: minijuegos-WEB — juegos en itch.io (importación)

**Contexto:** Reemplazo del upload ZIP local por importación desde itch.io. El alumno pega la URL pública de su juego; GameCraft resuelve el embed en servidor y lo muestra en iframe.

**Cambios:**
- `utils/gamePlayUrl.ts`: validación itch, `resolveGamePlayUrl` (embed itch + legacy `/games/`).
- `server/utils/itchEmbed.ts`: fetch HTML de página itch y extracción de game ID.
- `server/api/games/import-itch.post.ts`: dryRun (probar) y persistencia en Firestore.
- `server/api/games/clear-itch.post.ts`: quitar enlace sin afectar itch.io.
- `composables/useItchImport.ts`: cliente probar/guardar/limpiar.
- `pages/mis-juegos.vue`: sección itch con preview iframe obligatorio antes de guardar.
- `pages/juegos/[id].vue`: reproducción embed + enlace «Abrir en itch.io».
- Eliminados: upload ZIP (`upload.post.ts`, `delete.post.ts`, `gameUpload.ts`, `useDirectUpload.ts`).

**Decisiones:** `gameUrl` = página itch; `gameWebGLUrl` = URL embed para iframe. Builds legacy en `public/games/` siguen leyéndose.

**Próximos pasos:** Desplegar fix de resolución vía `/data.json`; usar URL itch publicada (no el slug de ejemplo).

**Archivos afectados:** `utils/gamePlayUrl.ts`, `server/utils/itchEmbed.ts`, `server/api/games/import-itch.post.ts`, `server/api/games/clear-itch.post.ts`, `composables/useItchImport.ts`, `pages/mis-juegos.vue`, `pages/juegos/[id].vue`, `.agents/guia-agentica.md`, `README.md`, `pages/bases.vue`

`#feature` `#refactor` `#bug`

---

## [2026-06-20]

### Proyecto: minijuegos-WEB — upload WebGL ZIP 5 MB (reemplazado por itch.io)

**Contexto:** Implementación del flujo de subida de builds Unity WebGL para estudiantes (titular y compañero).

**Cambios:**
- `utils/gameUpload.ts`: límite 5 MB, `resolveGamePlayUrl`, validación ZIP.
- `server/utils/gameUpload.ts`: extracción segura, limpieza previa, `index.html` en raíz del ZIP.
- `server/api/games/upload.post.ts`: solo ZIP, URL relativa, Bearer + permisos.
- `composables/useDirectUpload.ts`: `uploadGameZip` same-origin con token.
- `pages/mis-juegos.vue`: UI solo ZIP, drag-and-drop, mensajes de ayuda.
- `pages/juegos/[id].vue`: iframe con `resolveGamePlayUrl`.
- `delete.post.ts`: reutiliza `clearGameDir`.
- Docs: `.agents/guia-agentica.md`, `nuxt.config.ts` (comentario límite).

**Decisiones:** Mismo origen (Coolify/Cloudflare); sin HTTPS dual-port; URLs legacy se normalizan al leer.

**Próximos pasos:** Probar upload end-to-end en producción tras deploy.

**Archivos afectados:** `utils/gameUpload.ts`, `server/utils/gameUpload.ts`, `server/api/games/upload.post.ts`, `server/api/games/delete.post.ts`, `composables/useDirectUpload.ts`, `pages/mis-juegos.vue`, `pages/juegos/[id].vue`, `.agents/guia-agentica.md`, `nuxt.config.ts`

`#feature` `#upload`

---

## [2026-06-20]

### Proyecto: minijuegos-WEB — guía de programación agentica

**Contexto:** Análisis profundo del repo y validación con el equipo para documentar flujos, deuda técnica y convenciones orientadas a agentes de IA (Cursor).

**Cambios:**
- Creado `.agents/guia-agentica.md` (mapa técnico, Firestore, flujos, checklists, deuda priorizada).
- Actualizado `.agents/README.md` como índice.
- Reemplazado contenido obsoleto de `.cursor-project-rules.md` (antes apuntaba a `app-minijuegos` y `.ia/`).

**Decisiones documentadas:**
- Despliegue canónico: GitHub → Coolify; DNS Cloudflare.
- Admin: `allowed-emails` con `type: admin` (unificar código pendiente).
- Allowlist masiva vía `server/data/allowed-emails.ts` + sync script; panel admin para humanos.
- Páginas `/bases`, `/faq`, `/tematicas` con login intencional.
- Peer eval = Etapa 4; escala objetivo 1–5 en toda la plataforma.
- Equipos = duplas (titular + 1 compañero).
- `currentPhase` debe bloquear funcionalidades (hoy solo informativo; implementación pendiente).
- Upload WebGL: prioridad P0 antes de uso en prod (sin Bearer, URL fija, no probado en Coolify).

**Próximos pasos:** Corregir upload (`useDirectUpload.ts`), alinear escala peer eval, unificar rol admin, implementar gates por `currentPhase`.

**Archivos afectados:** `.agents/guia-agentica.md`, `.agents/README.md`, `.cursor-project-rules.md`, `.agents/context/historial.md`

`#docs` `#config`

---

## [2026-06-01]

### Proyecto: minijuegos-WEB — evaluación entre pares

**Contexto:** Feature planificado para que competidores evalúen juegos asignados aleatoriamente; el admin gestiona instancias, asignaciones y reporte final.

**Cambios:**
- Modelo Firestore `peerEvaluations` con subcolecciones `assignments` y `submissions`; reglas en `firestore.rules`.
- APIs Nitro `server/api/peer-eval/*` (crear, generar, iniciar, pausar, finalizar, reiniciar, eliminar, submit, listado, reporte).
- Utilidades `server/utils/peerEval*.ts` (asignación aleatoria con exclusiones propio/compañero, una evaluación activa).
- Admin: `pages/admin/evaluaciones-pares.vue`; competidores: `pages/evaluacion-juegos/*`; composable `usePeerEvaluations.ts`.
- Navegación en `Header.vue`, `layouts/admin.vue` y `pages/admin/index.vue`.

**Decisiones:** Escala 1–7 por criterio; comentarios obligatorios no vacíos; sin juego embebido; reporte solo al finalizar; cancelar = borrado permanente.

**Próximos pasos:** Desplegar reglas Firestore (`firebase deploy --only firestore:rules`) y probar flujo completo en entorno con Firebase Admin configurado.

**Archivos afectados:** `server/api/peer-eval/`, `server/utils/peerEval*.ts`, `composables/usePeerEvaluations.ts`, `utils/peerEval.ts`, `pages/admin/evaluaciones-pares.vue`, `pages/evaluacion-juegos/`, `firestore.rules`, `components/layout/Header.vue`, `layouts/admin.vue`

`#feature`

---

## [2026-04-29]

### Proyecto: minijuegos-WEB — rediseño UX/UI de `/mis-juegos`

**Contexto:** Se detectó desorden visual en la edición de juego (formulario poco claro, bloque de equipo extenso, separadores de cards con bajo contraste, exceso de espacios y alineaciones inconsistentes).

**Cambios:**
- `pages/mis-juegos.vue`: rediseño visual completo sin alterar lógica de negocio.
- Estructura visual reorganizada para flujo más claro: resumen de temática, ficha pública, portada, build WebGL, build actual, equipo y estado/publicación.
- Patrón de `UCard` unificado con divisores visibles en oscuro (`ui.divide`) y bordes consistentes para reforzar separación header/body.
- `Ficha pública del juego` remaquetada por grupos (`Identidad`, `Descripción`, `Enlaces`) con grid responsiva y barra de acciones alineada al final.
- `Equipo` compactado a formato de filas clave-valor; alta/baja de compañero en layout más denso y legible.
- Ajustes globales de densidad visual (padding/márgenes/tipografía) y mejor alineación general de títulos, ayudas y controles.

**Decisiones:** Se priorizó legibilidad y jerarquía visual manteniendo intactas las funcionalidades actuales (guardado, invitación de compañero, subida de build y publicación).

**Próximos pasos:**
- Validar percepción visual final en móvil real y escritorio con usuarios del curso.
- Si se desea mayor guía operativa, añadir indicador de progreso por pasos (ficha, portada, build, publicación) en una iteración posterior.

**Archivos afectados:** `pages/mis-juegos.vue`, `.agents/context/historial.md`

`#feature` `#refactor` `#docs`

---

## [2026-04-28]

### Proyecto: minijuegos-WEB — `/mis-juegos` y ficha pública (plan GameCraft)

**Contexto:** Implementación del plan de mejora: ficha editable, portada, instrucciones, equipo, estados unificados, vista privada de ficha y endurecimiento parcial de seguridad.

**Cambios:**
- `composables/useGameStatus.ts`: estados canónicos y normalización desde valores legacy.
- `composables/useGames.ts`: interfaz ampliada, `displayGameTitle`, `canUserEditGame` / `isGameOwner`, normalización al cargar, `deleteField` al quitar compañero, `addTeammate`/`removeTeammate` con verificación de titular, alias `updateGameFicha`.
- `pages/mis-juegos.vue`: formulario de ficha con textos de ayuda, portada (Storage), equipo, publicación con validaciones, carga de tema como compañero (`teammateUid`), preview enlace a `/juegos/[id]`, eliminación de build vía API con token.
- `pages/juegos/[id].vue` y `pages/juegos/index.vue`: título visible `gameTitle`+`title`, listado coherente con estados, ficha sin versión/tamaño/motor genérico; acceso restringido si no está `publicado` salvo titular/compañero/admin.
- `pages/admin/juegos.vue`: filtros y formulario alineados a estados canónicos.
- `composables/useDirectUpload.ts`: acepta `File[]` o `FileList`.
- `firestore.rules`: `themes` — create docente, update por titular/compañero/reserva inicial/docente.
- `server/api/games/upload.post.ts`, `delete.post.ts`: verificación con Firebase Admin + token.

**Decisiones:** Publicación explícita; subir WebGL ya no fuerza `publicado` automáticamente (pasa a `en_desarrollo` si no estaba publicado).

**Archivos afectados:** listados arriba; desplegar reglas Firestore en consola o `firebase deploy --only firestore:rules`.

`#feature` `#config`

---

## [2026-04-27]

### Proyecto: minijuegos-WEB — calendario bases (Etapa 0 / Etapa 1)

**Contexto:** Ajuste de fechas en `/bases` para alinear Etapa 0 con el arranque actual y retrasar solo la Etapa 1 al siguiente lunes, sin mover Etapas 2–5.

**Cambios:**
- `pages/bases.vue`: Etapa 0 → lunes 27 de abril de 2026; selección de temática → del 27 de abril al 3 de mayo de 2026; Etapa 1 → lunes 4 de mayo de 2026; entregables y rúbrica Etapa 1 coherente; párrafo intro del calendario aclara el periodo de inscripción/selección.
- `pages/faq.vue` y `pautas_de_evaluacion.md`: mismas fechas en FAQ y tabla de referencia.

**Archivos afectados:** `pages/bases.vue`, `pages/faq.vue`, `pautas_de_evaluacion.md`

`#docs`

---

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
