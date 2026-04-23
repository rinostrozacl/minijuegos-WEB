# Contexto para IA (`.agents/`)

Esta carpeta centraliza **reglas y contexto** que la IA debe usar al trabajar en el repositorio.

## Archivos

| Ruta | Uso |
|------|-----|
| `context/historial.md` | Historial de conversaciones y cambios relevantes (única fuente para IA). |
| `proyectos.json` | Metadatos del proyecto en este repo. |
| `preferencias.json` | Preferencias opcionales de trabajo (formato libre). |
| `estadisticas.json` | Estadísticas opcionales (versiones, conteos, etc.). |

## Convenciones

- **Historial:** escribir solo en `context/historial.md`. No usar `.ia/` ni rutas legadas.
- **Secretos:** nunca en claro en historial; usar `[REDACTED]` y rutas relativas.
- **Idioma:** mensajes al usuario y notas en español, salvo que el código del archivo use otro idioma de forma consistente.

## Documentación de producto

- Raíz: `README.md`
- Carpeta `docs/` cuando exista documentación adicional.
