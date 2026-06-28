# Requerimientos — GameCraft2026

Plataforma web del torneo **GameCraft2026** para estudiantes de Ingeniería en Informática (Santo Tomás). Los equipos desarrollan videojuegos Unity con temáticas mitológicas chilenas/latinas.

## Objetivo del producto

Permitir que estudiantes registren cuenta, reserven una temática, editen la ficha de su juego, publiquen el build jugable y participen en evaluaciones. Los docentes administran cohorte, temáticas, fases y evaluación entre pares.

## Actores

| Actor | Descripción |
|-------|-------------|
| **Estudiante** | Registrado con email en allowlist (`allowed-emails`, `type: student`) |
| **Admin / docente** | Email en allowlist con `type: admin` (regla acordada; código aún parcialmente inconsistente) |
| **Visitante** | Ve juegos publicados y puede calificar (1–5) sin login |

## Entidades principales

| Concepto | Implementación |
|----------|----------------|
| Temática libre | Documento `themes` con `available: true` |
| Juego reservado | `themes` con `available: false`, `reservedById`, datos de ficha |
| Equipo | Dupla: titular + 1 compañero (`teammateUid`) |
| Build jugable | URL de **GitHub Pages** en `gameWebGLUrl` (iframe directo) |
| Enlace itch.io | Opcional en `gameUrl` (solo informativo/anexo en ficha) |
| Portada | Imagen en Firebase Storage `games/{themeId}/…` |

## Flujos funcionales

### Registro

1. Email debe estar en `allowed-emails` con `enabled: true`
2. Verificación OTP por correo (Resend)
3. Alta en Firebase Auth + documento `users/{uid}` vía API servidor

### Reserva de temática

1. Flag `appConfig/systemConfig.isReservationEnabled === true`
2. Usuario autenticado elige temática libre en `/tematicas`
3. Se marca `available: false` y se asocia al usuario

### Edición y publicación del juego

1. Titular o compañero editan ficha en `/mis-juegos`
2. Publican build WebGL en **GitHub Pages** (repo propio o carpeta del curso)
3. Pegan URL Pages → **Probar enlace** → **Guardar** (`POST /api/games/import-github-pages`)
4. Opcional: enlace itch.io como anexo en la ficha
5. Publicar requiere: título, descripción, instrucciones, imagen, juego enlazado
6. `gameStatus: publicado` → visible en `/juegos`

### Evaluación entre pares (Etapa 4)

- Admin crea instancia de evaluación y genera asignaciones aleatorias
- Estudiantes evalúan juegos asignados (escala objetivo **1–5**)
- Escritura solo vía APIs Nitro (Admin SDK)

### Calificaciones públicas

- Cualquier visitante califica juegos publicados (1–5) en `/juegos/[id]`

## Fases del concurso

Campo `appConfig/systemConfig.currentPhase`:

| Valor | Etapa | Funcionalidad esperada |
|-------|-------|------------------------|
| `preparation` | Etapa 0 | Info, registro |
| `reservation` | Selección temática | Reserva en `/tematicas` |
| `development` | Etapas 1–3 | Ficha, portada, enlace GitHub Pages |
| `submission` | Entregables | Importación/publicación |
| `evaluation` | Etapa 4–5 | Peer eval + ratings |
| `announcement` / `finished` | Cierre | Solo lectura |

**Estado actual:** solo `isRegistrationEnabled` e `isReservationEnabled` bloquean funcionalidades. El resto de gates por fase está **pendiente de implementación**.

## Restricciones técnicas acordadas

- **No** subir builds WebGL a Firebase Storage (solo portadas)
- **No** crear lógica nueva en colección legacy `games` — usar `themes`
- **No** escribir `peerEvaluations` desde cliente — solo Admin SDK
- Allowlist masiva: editar `server/data/allowed-emails.ts` + script sync
- Despliegue producción: **Coolify** (no docker-compose del repo)

## Referencias académicas

- Rúbricas detalladas: [`pautas_de_evaluacion.md`](../pautas_de_evaluacion.md)
- Bases del concurso: página `/bases` en la app
