# GameCraft2026 — Torneo de videojuegos (Unity)

Plataforma web del concurso GameCraft2026: registro, reserva de temáticas mitológicas, edición de ficha, publicación de juegos y evaluaciones.

**Producción:** https://gamecraft.cl  
**Deploy:** GitHub → Coolify → Cloudflare

## Documentación

| Audiencia | Enlace |
|-----------|--------|
| **Agentes IA** | [`.agents/guia-agentica.md`](.agents/guia-agentica.md) → [`.agents/README.md`](.agents/README.md) |
| **Índice técnico** | [`docs/README.md`](docs/README.md) |
| **Requerimientos** | [`docs/requerimientos.md`](docs/requerimientos.md) |
| **MCP Firebase** | [`docs/mcp-firebase.md`](docs/mcp-firebase.md) |
| **Desarrollo local** | [`docs/desarrollo-local.md`](docs/desarrollo-local.md) |
| **Despliegue** | [`docs/despliegue.md`](docs/despliegue.md) |

## Juegos en GitHub Pages

Los equipos publican su build Unity WebGL en **GitHub Pages** y enlazan la URL en GameCraft:

1. Copiar el build Unity WebGL en el repo (ej. `exportacionjuego/`).
2. Configurar GitHub Pages (workflow en `public/ejemplos/deploy-exportacionjuego-pages.yml`).
3. En `/mis-juegos`, pegar la URL de GitHub Pages → **Probar enlace** → **Guardar**.
4. Opcional: enlace a itch.io como información anexa en la ficha.

Reproducción en `/juegos/[id]` vía iframe directo a GitHub Pages.

## Inicio rápido (desarrollo)

```bash
git clone <repo-url>
cd minijuegos-WEB
npm install
cp .env.example .env
# Editar .env con credenciales Firebase y Resend
npm run dev
```

Abrir http://localhost:3000

## Stack

- **Frontend:** Nuxt 3, Vue 3, Nuxt UI, Tailwind
- **Backend:** Nitro (`server/api/*`)
- **Firebase:** Auth, Firestore, Storage (portadas)
- **Email:** Resend (OTP registro)

## Scripts útiles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor desarrollo |
| `npm run build` | Build producción |
| `npm run seed:themes` | Cargar 30 temáticas en Firestore |

## Infraestructura legacy

Los archivos `docker-compose.yml`, `DOCKER_SETUP.md` y `.github/workflows/deploy.yml` son referencia histórica. El despliegue canónico es **Coolify** (ver [`docs/despliegue.md`](docs/despliegue.md)).
