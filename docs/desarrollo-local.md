# Desarrollo local — GameCraft2026

## Requisitos

- Node.js 18+
- npm o yarn
- Cuenta Firebase con acceso al proyecto `minijuegos-1012b`
- (Opcional) OpenSSL para certificados HTTPS locales

## Setup inicial

```bash
git clone <repo-url>
cd minijuegos-WEB
npm install
cp .env.example .env
# Editar .env con valores Firebase y Resend
```

## Variables de entorno

Copiar desde [`.env.example`](../.env.example).

### Cliente (requeridas para auth/Firestore)

```
NUXT_PUBLIC_FIREBASE_API_KEY=...
NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NUXT_PUBLIC_FIREBASE_PROJECT_ID=minijuegos-1012b
NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NUXT_PUBLIC_FIREBASE_APP_ID=...
```

### Servidor (APIs con Admin SDK)

Opción local recomendada — JSON de cuenta de servicio:

```
FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account",...}
```

O variables individuales (menos fiable en algunos entornos):

```
FIREBASE_PROJECT_ID=minijuegos-1012b
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
```

### Email (registro OTP)

```
RESEND_API_KEY=...
RESEND_FROM_EMAIL=GameCraft2026 <info@codepulse.cl>
```

## Comandos

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor desarrollo (http://localhost:3000) |
| `npm run dev:https` | Desarrollo con HTTPS |
| `npm run build` | Build producción |
| `npm run preview` | Preview del build |
| `npm run start` | Servidor producción (`start-server.js`) |
| `npm run seed:themes` | Seed temáticas Firestore |

## Certificados HTTPS locales

Nuxt usa certificados en `./certs/` (configurado en `nuxt.config.ts`):

```bash
./docker-scripts/generate-ssl-certs.sh
```

## Scripts útiles

| Script | Uso |
|--------|-----|
| `scripts/seed-themes-2026.mjs` | Cargar 30 temáticas |
| `scripts/sync-allowed-emails-from-ts.mjs` | Sync allowlist |
| `scripts/delete-all-users-except-admin.mjs` | ⚠️ Limpieza usuarios |
| `scripts/delete-all-allowed-emails-except-admin.mjs` | ⚠️ Limpieza allowlist |

Seed con reset de reservas:

```bash
node scripts/seed-themes-2026.mjs --reset-available
```

## MCP Firebase (agentes Cursor)

Para que un agente pueda consultar Firestore desde Cursor, configurar MCP en `~/.cursor/mcp.json`. Ver [mcp-firebase.md](./mcp-firebase.md).

## Verificación

1. `npm run dev` → abrir http://localhost:3000
2. `GET http://localhost:3000/api/health` → OK
3. `GET http://localhost:3000/api/health/firebase-admin` → `{ initialized: true }`
4. Login con usuario de prueba en allowlist

## Docker (legacy / referencia)

El repo incluye `docker-compose.yml` y scripts en `docker-scripts/`. **No** es el flujo de producción actual. Ver [despliegue.md](./despliegue.md).

## Troubleshooting

| Problema | Solución |
|----------|----------|
| Firebase Admin no inicializa | Verificar JSON/credenciales; revisar `/api/health/firebase-admin` |
| permission-denied en Firestore cliente | Reglas Firestore; email no en allowlist |
| OTP no llega | Verificar `RESEND_API_KEY` y dominio verificado |
| HTTPS dev falla | Regenerar certs en `./certs/` |

## Referencias

- [firebase.md](./firebase.md)
- [../DOCKER_SETUP.md](../DOCKER_SETUP.md)
