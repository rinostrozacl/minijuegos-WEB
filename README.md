# GameCraft2026 - Torneo de videojuegos (Unity)

## Juegos en itch.io

Los equipos publican su build HTML5/WebGL en [itch.io](https://itch.io) y enlazan el juego desde GameCraft:

1. En `/mis-juegos`, pegar la URL de la página del juego (ej. `https://usuario.itch.io/mi-juego`)
2. **Probar enlace** — el servidor resuelve el embed de itch.io
3. Revisar la vista previa en iframe
4. **Guardar juego en GameCraft** — persiste en Firestore (`gameUrl`, `gameWebGLUrl`)

Reproducción pública en `/juegos/[id]` vía iframe `https://itch.io/embed/{id}`.

Builds legacy en `/public/games/` (subida ZIP antigua) siguen funcionando si ya existían.

## 🚀 Deploy Automático

GitHub Actions ejecuta automáticamente:

1. **Actualización de código**
2. **Generación de certificados SSL** para IP 192.95.7.30
3. **Build del proyecto**
4. **Verificación de puertos duales** (8081 HTTP + 8443 HTTPS)

### Deploy Manual

```bash
# En el servidor
./docker-scripts/deploy.sh
```

## 📂 Estructura del Proyecto

### Frontend (Nuxt 3)

- **Import itch.io**: `composables/useItchImport.ts` — `POST /api/games/import-itch` (dryRun + guardar, Bearer token)
- **URLs de reproducción**: `utils/gamePlayUrl.ts` — `resolveGamePlayUrl` (embed itch + builds legacy `/games/`)
- **Mi juego / ficha**: `pages/mis-juegos.vue` — ficha, portada, enlace itch, equipo, estados `borrador` / `en_desarrollo` / `publicado`
- **Estados canónicos**: `composables/useGameStatus.ts` (normaliza valores legacy `not_started`, `in_progress`, etc.)

### Backend (Nitro)

- **Import itch**: `server/api/games/import-itch.post.ts` — resuelve embed desde HTML de la página itch
- **Quitar enlace**: `server/api/games/clear-itch.post.ts`
- **Utilidad**: `server/utils/itchEmbed.ts`
- **Legacy**: builds antiguos en `/public/games/{themeId}/` si `gameWebGLUrl` apunta ahí

### Temáticas 2026 (Firestore)

- Listado de las 30 leyendas: `data/themes-gamecraft-2026.json`
- Carga con cuenta de servicio: `npm run seed:themes` (ver cabecera de `scripts/seed-themes-2026.mjs`). Opcional: `node scripts/seed-themes-2026.mjs --reset-available` para liberar reservas.

### Infraestructura

- **Docker**: Puertos duales 8081 (HTTP) + 8443 (HTTPS)
- **SSL**: Certificados autofirmados para desarrollo
- **Deploy**: GitHub Actions + scripts automatizados

## 🔧 Configuración de Desarrollo

### Requisitos

- Docker & Docker Compose
- OpenSSL (para certificados)
- Node.js 18+ (desarrollo local)

### Inicio Rápido

```bash
# Clonar repositorio
git clone [repo-url]
cd minijuegos-WEB

# Desarrollo local
npm install
npm run dev

# Deploy con Docker
./docker-scripts/deploy.sh
```

## 🔒 Certificados SSL

Los certificados se generan automáticamente para:

- **localhost** (desarrollo)
- **192.95.7.30** (producción)

Para regenerar:

```bash
./docker-scripts/generate-ssl-certs.sh
```

## 🎮 URLs del Sistema

### Desarrollo

- Web: http://localhost:3000
- Uploads: https://localhost:3443

### Producción

- Web: https://gamecraft.cl
- Uploads: https://192.95.7.30:8443

## 📝 Historial de Cambios

### v2.0 - Sistema Simplificado

- ❌ Eliminado Firebase Storage para uploads
- ❌ Eliminado sistema de chunks
- ❌ Eliminado diferenciación por tamaño
- ✅ Solo HTTPS directo para todos los archivos
- ✅ Certificados SSL automáticos
- ✅ Deploy automatizado con GitHub Actions
