# Configuración HTTPS para Desarrollo

## ¿Por qué necesitamos HTTPS?

Unity WebGL con archivos Brotli (`.br`) **requiere HTTPS** para funcionar correctamente. Los navegadores modernos no permiten la carga de archivos Brotli sobre HTTP por razones de seguridad.

## Configuración Automática

El proyecto ya está configurado para usar HTTPS en desarrollo:

### 1. Certificados SSL

Los certificados autofirmados ya están generados en `certs/`:

- `localhost-cert.pem` - Certificado público
- `localhost-key.pem` - Clave privada

### 2. Configuración Nuxt

El archivo `nuxt.config.ts` ya está configurado para usar HTTPS:

```typescript
devServer: {
  https: {
    key: './certs/localhost-key.pem',
    cert: './certs/localhost-cert.pem'
  },
  port: 3000
}
```

## Iniciar el Servidor

### Opción 1: Comando normal

```bash
npm run dev
```

### Opción 2: Comando explícito HTTPS

```bash
npm run dev:https
```

Ambos comandos iniciarán el servidor en `https://localhost:3000`

## Advertencia del Navegador

Al acceder por primera vez a `https://localhost:3000`, tu navegador mostrará una advertencia de seguridad porque el certificado es autofirmado.

**Para continuar:**

1. Chrome/Edge: Haz clic en "Avanzado" → "Continuar a localhost (no seguro)"
2. Firefox: Haz clic en "Avanzado" → "Aceptar el riesgo y continuar"
3. Safari: Haz clic en "Mostrar detalles" → "Visitar este sitio web"

## Verificar que Funciona

1. Visita `https://localhost:3000` (acepta el certificado)
2. Ve a la sección de juegos
3. Los juegos Unity WebGL deberían cargar sin errores de Brotli

## Regenerar Certificados (si es necesario)

Si necesitas regenerar los certificados:

```bash
# Eliminar certificados existentes
rm -rf certs/

# Crear directorio
mkdir certs

# Generar nuevos certificados
openssl req -x509 -newkey rsa:2048 -keyout certs/localhost-key.pem -out certs/localhost-cert.pem -days 365 -nodes -subj "/C=US/ST=CA/L=San Francisco/O=Dev/CN=localhost"
```

## Solución de Problemas

### Error: "Unable to parse Build/web.framework.js.br!"

- **Causa**: Estás accediendo via HTTP en lugar de HTTPS
- **Solución**: Usa `https://localhost:3000` en lugar de `http://localhost:3000`

### Error: "Could not load module"

- **Causa**: Dependencias faltantes
- **Solución**: Ejecuta `npm install` para instalar todas las dependencias

### Error: "Certificate not trusted"

- **Causa**: Certificado autofirmado
- **Solución**: Acepta el certificado en tu navegador (es seguro para desarrollo local)

## Producción

En producción, usa un certificado SSL válido de una autoridad certificadora (Let's Encrypt, etc.). Los certificados autofirmados son solo para desarrollo local.
