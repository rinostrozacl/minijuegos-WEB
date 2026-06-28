# MCP Firebase — Guía para agentes

El servidor MCP **`firebase-mcp`** (`@gannonh/firebase-mcp`) permite a los agentes de Cursor consultar y modificar Firestore, Storage y Auth del proyecto GameCraft2026 **sin escribir scripts ad hoc**.

## Estado actual

| Aspecto | Detalle |
|---------|---------|
| Servidor MCP | `firebase-mcp` (identificador Cursor: `user-firebase-mcp`) |
| Paquete | `@gannonh/firebase-mcp` vía `npx` |
| Proyecto Firebase | `minijuegos-1012b` |
| Bucket Storage | `minijuegos-1012b.firebasestorage.app` |
| Credencial | JSON de cuenta de servicio (misma que Admin SDK del servidor) |

## Configuración (Cursor)

El MCP se configura en `~/.cursor/mcp.json` del desarrollador (no va en el repo):

```json
{
  "mcpServers": {
    "firebase-mcp": {
      "command": "npx",
      "args": ["-y", "@gannonh/firebase-mcp"],
      "env": {
        "SERVICE_ACCOUNT_KEY_PATH": "/ruta/absoluta/al/service-account.json",
        "FIREBASE_STORAGE_BUCKET": "minijuegos-1012b.firebasestorage.app"
      }
    }
  }
}
```

**Requisitos:**

1. Archivo JSON de cuenta de servicio de Firebase (descargado desde Console → Project settings → Service accounts)
2. El archivo debe estar en `.gitignore` (ej. `minijuegos-firebasekey.json`)
3. Reiniciar Cursor tras cambiar `mcp.json`

Si el MCP no aparece disponible, verificar que Cursor tenga habilitado el servidor y que la ruta al JSON sea válida.

## Herramientas disponibles

### Firestore

| Tool | Uso |
|------|-----|
| `firestore_list_collections` | Listar colecciones raíz |
| `firestore_list_documents` | Listar docs con filtros, orden y paginación |
| `firestore_get_document` | Leer un documento por ID |
| `firestore_add_document` | Crear documento (ID auto o manual) |
| `firestore_update_document` | Actualizar campos |
| `firestore_delete_document` | Eliminar documento |
| `firestore_query_collection_group` | Query en collection group |

### Storage

| Tool | Uso |
|------|-----|
| `storage_list_files` | Listar archivos en bucket/path |
| `storage_get_file_info` | Metadatos de un archivo |
| `storage_upload` | Subir archivo local |
| `storage_upload_from_url` | Subir desde URL |

### Auth

| Tool | Uso |
|------|-----|
| `auth_get_user` | Obtener usuario por UID o email |

## Cuándo usar MCP vs código

| Situación | Recomendación |
|-----------|---------------|
| Inspeccionar datos en sesión de agente | ✅ MCP |
| Verificar estado post-cambio | ✅ MCP |
| Operaciones batch masivas | Scripts en `scripts/` |
| Lógica de negocio nueva | Código en `server/` o composables |
| Cambios que la app hará en runtime | Código, no MCP directo |

## Ejemplos de consultas útiles

### Listar temáticas reservadas

```
firestore_list_documents
  collection: themes
  filters: [{ field: "available", operator: "==", value: "false" }]
  limit: 30
```

### Leer configuración del sistema

```
firestore_get_document
  collection: appConfig
  id: systemConfig
```

### Ver allowlist de un email

```
firestore_get_document
  collection: allowed-emails
  id: usuario_ejemplo_cl   # @ → _, . → _
```

### Listar evaluaciones entre pares

```
firestore_list_documents
  collection: peerEvaluations
  orderBy: [{ field: "createdAt", direction: "desc" }]
  limit: 10
```

## Precauciones para agentes

1. **No borrar datos de producción** sin confirmación explícita del usuario
2. **No modificar `peerEvaluations`** salvo tarea explícita de migración/debug
3. **Allowlist:** preferir editar `server/data/allowed-emails.ts` + sync script antes que MCP manual
4. **Reglas Firestore:** el MCP usa Admin SDK (bypass de reglas); la app cliente sí las respeta
5. **No documentar ni commitear** rutas reales de service account keys

## Colecciones frecuentes

Ver [firebase.md](./firebase.md) para esquema completo.

| Colección | ID típico |
|-----------|-----------|
| `themes` | slug temática (ej. `mapuche-001`) |
| `users` | Firebase Auth UID |
| `allowed-emails` | email normalizado |
| `appConfig` | `systemConfig` |
| `peerEvaluations` | UUID generado |
| `ratings` | auto |

## Troubleshooting

| Problema | Solución |
|----------|----------|
| MCP no conecta | Verificar `mcp.json`, ruta JSON, reiniciar Cursor |
| Permission denied | Cuenta de servicio debe tener rol Editor o Firebase Admin |
| Proyecto incorrecto | Verificar project ID en el JSON de la cuenta de servicio |
| Storage bucket error | Confirmar `FIREBASE_STORAGE_BUCKET` en env del MCP |

## Referencias

- [firebase.md](./firebase.md) — modelo de datos
- [../.agents/guia-agentica.md](../.agents/guia-agentica.md) — flujos y antipatrones
