# GameCraft2026 - Torneo de videojuegos (Unity)

## 🎯 Sistema de Upload Simplificado

**Solo HTTPS Directo - Sin Firebase Storage - Sin Chunks**

### Arquitectura Actual

```
Navegación Web: Internet → Cloudflare → nginx-proxy → Puerto 8081
Uploads:        Usuario → HTTPS Directo → Puerto 8443 (Bypass Cloudflare)
```

### Ventajas del Sistema Simplificado

- ✅ **Sin límites**: Bypass completo de Cloudflare para uploads
- ✅ **Sin Mixed Content**: HTTPS directo evita errores de seguridad
- ✅ **Una sola ruta**: Todos los archivos via HTTPS directo
- ✅ **Sin complejidad**: No más decisiones por tamaño de archivo

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

- **Upload**: `composables/useDirectUpload.ts` (único sistema)
- **UI**: `pages/mis-juegos.vue` (función simplificada)

### Backend (Nitro)

- **Upload**: `server/api/games/upload.post.ts` (solo directo)
- **Storage**: `/public/games/{themeId}/` (sistema de archivos)

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
