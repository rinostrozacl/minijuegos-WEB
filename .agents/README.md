# Contexto para IA (`.agents/`)

Carpeta central de **reglas y contexto** para agentes de IA en este repositorio.

## Inicio de sesión (agente)

1. Leer **[guia-agentica.md](./guia-agentica.md)** — mapa técnico, flujos, deuda, checklists
2. Revisar **[docs/README.md](../docs/README.md)** — índice documentación estructurada
3. Si necesitas consultar Firestore: **[docs/mcp-firebase.md](../docs/mcp-firebase.md)**
4. Revisar últimas entradas de **[context/historial.md](./context/historial.md)**
5. Confirmar alcance de la tarea antes de tocar código

## Documentación principal

| Documento | Uso |
|-----------|-----|
| **[guia-agentica.md](./guia-agentica.md)** | Guía completa de programación agentica |
| **[../docs/README.md](../docs/README.md)** | Índice docs técnicos (arquitectura, APIs, Firebase, deploy) |
| **[../docs/mcp-firebase.md](../docs/mcp-firebase.md)** | MCP Firebase para consultas Firestore/Storage |
| **[context/historial.md](./context/historial.md)** | Historial cronológico (única fuente para sesiones IA) |

## Metadatos

| Archivo | Uso |
|---------|-----|
| `proyectos.json` | Metadatos del proyecto |
| `preferencias.json` | Preferencias opcionales de trabajo |
| `estadisticas.json` | Estadísticas opcionales |

## Convenciones

- **Historial:** escribir solo en `context/historial.md`. No usar `.ia/` ni rutas legadas.
- **Secretos:** nunca en claro; usar `[REDACTED]` y rutas relativas.
- **Idioma:** español en interacciones y notas, salvo convención del código del archivo.
- **Producto:** `README.md`, `docs/requerimientos.md`, `pautas_de_evaluacion.md`.
