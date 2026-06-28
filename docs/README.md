# Documentación — GameCraft2026 (minijuegos-WEB)

Índice de documentación del proyecto. Los agentes de IA deben leer primero [`.agents/guia-agentica.md`](../.agents/guia-agentica.md) y este índice.

## Para agentes de IA (inicio rápido)

1. [Guía agentica](../.agents/guia-agentica.md) — mapa técnico, flujos, deuda, checklists
2. [MCP Firebase](./mcp-firebase.md) — consultar/modificar Firestore y Storage desde Cursor
3. [Historial de decisiones](../.agents/context/historial.md) — cambios recientes
4. [Requerimientos](./requerimientos.md) — qué hace el producto y reglas de negocio

## Documentación técnica

| Documento | Contenido |
|-----------|-----------|
| [requerimientos.md](./requerimientos.md) | Alcance funcional, roles, fases del concurso |
| [arquitectura.md](./arquitectura.md) | Stack, capas, mapa de carpetas, composables |
| [firebase.md](./firebase.md) | Proyecto Firebase, colecciones, reglas, credenciales |
| [mcp-firebase.md](./mcp-firebase.md) | Uso del MCP `firebase-mcp` en Cursor |
| [apis.md](./apis.md) | Endpoints Nitro (`server/api/*`) |
| [desarrollo-local.md](./desarrollo-local.md) | Setup local, variables, scripts |
| [despliegue.md](./despliegue.md) | Producción (Coolify), DNS, health checks |

## Documentación de producto y operaciones

| Documento | Contenido |
|-----------|-----------|
| [../README.md](../README.md) | Resumen del repo e inicio rápido |
| [../pautas_de_evaluacion.md](../pautas_de_evaluacion.md) | Rúbricas académicas (escala 1–5) |
| [../DOCKER_SETUP.md](../DOCKER_SETUP.md) | Docker legacy (referencia, no prod actual) |
| [../HTTPS_SETUP.md](../HTTPS_SETUP.md) | Certificados HTTPS legacy |

## Convenciones

- **Idioma:** español en docs, mensajes al usuario y comentarios nuevos.
- **Secretos:** nunca en documentación ni historial; usar `[REDACTED]`.
- **Contexto IA:** solo en `.agents/` (no usar `.ia/`).
- **Tras cambios grandes:** actualizar `guia-agentica.md`, docs afectados e `historial.md`.
