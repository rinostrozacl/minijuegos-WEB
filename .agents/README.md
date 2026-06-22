# Contexto para IA (`.agents/`)

Carpeta central de **reglas y contexto** para agentes de IA en este repositorio.

## Documentación principal

| Documento | Uso |
|-----------|-----|
| **[guia-agentica.md](./guia-agentica.md)** | Guía completa de programación agentica: arquitectura, flujos, deuda técnica, checklists |
| [context/historial.md](./context/historial.md) | Historial cronológico de cambios y decisiones (única fuente para sesiones IA) |

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
- **Producto:** `README.md`, `pautas_de_evaluacion.md`; carpeta `docs/` cuando exista documentación adicional.

## Inicio de sesión (agente)

1. Leer `guia-agentica.md`
2. Revisar últimas entradas de `context/historial.md`
3. Confirmar alcance de la tarea antes de tocar código
