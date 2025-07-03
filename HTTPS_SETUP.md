# Configuración HTTPS Directo - Sistema Simplificado

## 🎯 Arquitectura Final

**Sistema Único: Solo HTTPS Directo**

```
Internet → Cloudflare → nginx-proxy → Docker Container (Puerto 8081)
                    ↘
Archivos Grandes → HTTPS Directo → Docker Container (Puerto 8443)
```

### ✅ Cambios Implementados

- **Eliminado**: Firebase Storage para uploads
- **Eliminado**: Sistema de chunks
- **Eliminado**: Diferenciación por tamaño de archivo
- **Mantenido**: Solo upload directo HTTPS para TODOS los archivos

## 🔧 Configuración del Sistema

### 1. Docker Configuration

```yaml
# docker-compose.yml
ports:
  - "8081:3000" # Puerto HTTP principal (nginx-proxy)
  - "8443:3443" # Puerto HTTPS directo para uploads
```

### 2. Servidor Dual HTTP/HTTPS

- **Puerto 8081**: HTTP via nginx-proxy (para navegación web)
- **Puerto 8443**: HTTPS directo (para uploads)
- **Certificados**: SSL autofirmados para IP 192.95.7.30

### 3. Sistema de Upload Único

```javascript
// Todos los archivos van via HTTPS directo
const DIRECT_HTTPS_URL = "https://192.95.7.30:8443";

// Sin diferenciación por tamaño
const uploadResult = await smartUploadDirect(files, themeId);
```

## 🚀 Instrucciones de Despliegue

### Paso 1: Generar Certificados SSL

```bash
# En el servidor
cd /path/to/project
chmod +x docker-scripts/generate-ssl-certs.sh
./docker-scripts/generate-ssl-certs.sh
```

### Paso 2: Build y Deploy

```bash
# Build del proyecto
npm run build

# Reiniciar contenedor
docker-compose down
docker-compose up -d --build
```

### Paso 3: Verificar Funcionamiento

```bash
# Verificar puertos
curl -k https://192.95.7.30:8443/api/health
curl http://192.95.7.30:8081/api/health

# Verificar certificados
openssl s_client -connect 192.95.7.30:8443 -servername 192.95.7.30
```

## 🔍 Troubleshooting

### Error: Mixed Content

- ✅ **Solucionado**: Todos los uploads usan HTTPS directo
- ✅ **Bypass**: Cloudflare completamente evitado para uploads

### Error: Request Entity Too Large

- ✅ **Solucionado**: HTTPS directo no tiene límites de Cloudflare
- ✅ **Configurado**: nginx-proxy con CLIENT_MAX_BODY_SIZE=500m

### Error de Certificados

```bash
# Regenerar certificados si es necesario
./docker-scripts/generate-ssl-certs.sh

# Verificar permisos
ls -la certs/
```

## 📝 Archivos Modificados

### Frontend

- `composables/useDirectUpload.ts` - Sistema único simplificado
- `pages/mis-juegos.vue` - Una sola función de upload

### Backend

- `server/api/games/upload.post.ts` - Solo manejo directo
- **Eliminados**: upload-chunk.post.ts, finalize-upload.post.ts, upload-direct.post.ts

### Configuración

- `docker-compose.yml` - Puertos duales
- `start-server.js` - Servidor HTTPS directo
- `docker-scripts/generate-ssl-certs.sh` - Certificados SSL

## 🎮 Flujo de Upload Simplificado

1. **Usuario selecciona archivos** → Frontend
2. **Detección automática** → Unity WebGL o archivos individuales
3. **Creación de ZIP** → Si múltiples archivos
4. **Upload directo** → `https://192.95.7.30:8443/api/games/upload`
5. **Extracción en servidor** → `/public/games/{themeId}/`
6. **URL del juego** → `https://192.95.7.30:8443/games/{themeId}/index.html`

## 🔒 Seguridad

### Certificados Autofirmados

- **Desarrollo**: Aceptables para testing
- **Producción**: Considerar Let's Encrypt o certificados comerciales

### Configuración Recomendada para Producción

```bash
# Let's Encrypt (alternativa futura)
certbot certonly --standalone -d 192.95.7.30

# O certificado comercial para el dominio
# certbot certonly --standalone -d uploads.gamecraft.cl
```

## ✅ Estado Final

- **Sistema simplificado**: Una sola ruta de upload
- **Sin complejidad**: No más decisiones por tamaño
- **HTTPS seguro**: Sin errores Mixed Content
- **Bypass total**: Cloudflare evitado para uploads grandes
- **Rendimiento**: Directo al servidor sin proxies adicionales
