# Despliegue — GameCraft2026

## Producción actual (fuente de verdad)

```
Git push → GitHub → Coolify (detecta cambio) → build & deploy
DNS → Cloudflare → aplicación en servidor
URL producción: https://gamecraft.cl
```

**No usar como referencia operativa:**

- `docker-compose.yml` del repo
- `apphosting.yaml` / `apphosting.yaml.example`
- `.github/workflows/deploy.yml` (rama legacy `main2`)

Estos archivos existen por historial; el despliegue canónico es **Coolify**.

## Variables en Coolify

Configurar en el panel de Coolify (runtime), **no** commitear al repo.

### Build (cliente Firebase)

```
NUXT_PUBLIC_FIREBASE_API_KEY
NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NUXT_PUBLIC_FIREBASE_PROJECT_ID
NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NUXT_PUBLIC_FIREBASE_APP_ID
NUXT_PUBLIC_FIREBASE_MEASUREMENT_ID
```

### Runtime (servidor)

```
PORT=3000
HOST=0.0.0.0
RESEND_API_KEY
RESEND_FROM_EMAIL=GameCraft2026 <info@codepulse.cl>
FIREBASE_SERVICE_ACCOUNT_JSON_BASE64=<base64 del JSON>
```

**Recomendado:** `FIREBASE_SERVICE_ACCOUNT_JSON_BASE64` (evita problemas con `\n` en private key).

Generar base64:

```bash
base64 -i minijuegos-firebasekey.json | tr -d '\n'
```

## Verificación post-deploy

```bash
curl https://gamecraft.cl/api/health
curl https://gamecraft.cl/api/health/firebase-admin
```

Esperado en firebase-admin: `{ "initialized": true }`.

## Firestore rules

Si cambian `firestore.rules`:

```bash
firebase deploy --only firestore:rules
```

Proyecto: `minijuegos-1012b` (ver `.firebaserc`).

## Storage rules

Si cambian `storage.rules`:

```bash
firebase deploy --only storage
```

## Builds WebGL (GitHub Pages)

Los juegos **no** se despliegan con la app principal. Cada equipo:

1. Publica build Unity WebGL en GitHub Pages
2. Enlaza la URL en `/mis-juegos`
3. GameCraft reproduce vía iframe a `*.github.io`

Ejemplo de referencia en repo: `testjuego/` + workflow `.github/workflows/deploy-testjuego-pages.yml`.

## Builds legacy en servidor

Juegos antiguos en `public/games/{themeId}/` se sirven estáticamente. En Coolify, verificar persistencia del volumen si aplica.

## Infraestructura legacy (referencia)

| Recurso | Notas |
|---------|-------|
| `DOCKER_SETUP.md` | Volúmenes Docker |
| `HTTPS_SETUP.md` | Certificados IP 192.95.7.30 |
| `docker-scripts/deploy.sh` | Deploy manual legacy |

## Checklist deploy

- [ ] Variables en Coolify (build + runtime)
- [ ] `GET /api/health/firebase-admin` → `initialized: true`
- [ ] Registro OTP funciona (Resend)
- [ ] Import GitHub Pages en `/mis-juegos`
- [ ] Si cambiaron reglas: `firebase deploy --only firestore:rules`

## Referencias

- [desarrollo-local.md](./desarrollo-local.md)
- [../.env.example](../.env.example)
