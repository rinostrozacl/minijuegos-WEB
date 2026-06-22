# GameCraft2026 - Torneo de videojuegos (Unity)

## Juegos en GitHub Pages

Los equipos publican su build WebGL en **GitHub Pages** y enlazan la URL en GameCraft:

1. Copiar el build Unity WebGL en `testjuego/` (o en otro repo con Pages).
2. Push a `main` → workflow `deploy-testjuego-pages.yml` publica en Pages.
3. En `/mis-juegos`, pegar la URL de GitHub Pages → **Probar enlace** → **Guardar**.
4. Opcional: enlace a itch.io solo como información anexa en la ficha.

Reproducción en `/juegos/[id]` vía iframe directo a GitHub Pages.

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

- **Import GitHub Pages**: `composables/useGithubPagesImport.ts` — `POST /api/games/import-github-pages`
- **URLs de reproducción**: `utils/gamePlayUrl.ts` — GitHub Pages + legacy `/games/`
- **Mi juego / ficha**: `pages/mis-juegos.vue` — GitHub Pages (juego) + itch.io opcional (anexo)
- **Estados canónicos**: `composables/useGameStatus.ts` (normaliza valores legacy `not_started`, `in_progress`, etc.)

### Backend (Nitro)

- **Import Pages**: `server/api/games/import-github-pages.post.ts`
- **Validación**: `server/utils/githubPagesPlay.ts`
- **Carpeta ejemplo**: `testjuego/` + `.github/workflows/deploy-testjuego-pages.yml`

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
