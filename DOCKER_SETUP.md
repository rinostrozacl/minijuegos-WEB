# Configuración Docker para GameCraft2025

## 🐳 Persistencia de Datos Asegurada

### **Problema Resuelto**
La configuración Docker ahora incluye **volúmenes persistentes** que aseguran que los juegos subidos **NO se pierdan** cuando el contenedor se reinicie o actualice.

## 📋 **Configuración de Volúmenes**

### **Volúmenes Configurados:**
- **`games_data`**: Almacena todos los juegos Unity WebGL subidos
- **`ssl_certs`**: Almacena certificados SSL para HTTPS

### **Ubicaciones:**
- **Contenedor**: `/app/public/games` → **Host**: Volumen Docker persistente
- **Contenedor**: `/app/certs` → **Host**: Volumen Docker persistente

## 🚀 **Despliegue**

### **Opción 1: Script Automatizado (RECOMENDADO)**
```bash
# Ejecutar script de despliegue completo
./docker-scripts/deploy.sh
```

Este script:
- ✅ Verifica requisitos
- ✅ Configura volúmenes persistentes
- ✅ Crea backup automático de datos existentes
- ✅ Construye y despliega la aplicación
- ✅ Verifica que todo funcione correctamente

### **Opción 2: Manual**
```bash
# 1. Crear volúmenes persistentes
./docker-scripts/manage-volumes.sh create

# 2. Construir y desplegar
docker-compose build --no-cache
docker-compose up -d

# 3. Verificar estado
./docker-scripts/manage-volumes.sh status
```

## 💾 **Gestión de Volúmenes**

### **Script de Gestión**
```bash
# Ver estado de volúmenes
./docker-scripts/manage-volumes.sh status

# Listar juegos almacenados
./docker-scripts/manage-volumes.sh list-games

# Crear backup de juegos
./docker-scripts/manage-volumes.sh backup

# Restaurar backup
./docker-scripts/manage-volumes.sh restore backups/games-backup-YYYYMMDD-HHMMSS.tar.gz

# Ver ayuda completa
./docker-scripts/manage-volumes.sh help
```

### **Comandos Docker Directos**
```bash
# Ver volúmenes existentes
docker volume ls | grep gamecraft

# Inspeccionar volumen de juegos
docker volume inspect gamecraft_games_data

# Ver contenido del volumen
docker run --rm -v gamecraft_games_data:/data alpine ls -la /data
```

## 🔧 **Configuración del Servidor**

### **Puertos Expuestos:**
- **8081** → Aplicación web (puerto externo)
- **3000** → Puerto interno del contenedor

### **Variables de Entorno:**
Configuradas en `docker-compose.yml`:
- Firebase Admin SDK
- Firebase Client SDK
- Resend API Key
- Configuración de host virtual

### **Archivos de Configuración:**
- `docker-compose.yml` - Configuración principal
- `Dockerfile` - Imagen de la aplicación
- `.env` - Variables de entorno locales (montado como volumen)

## 📊 **Monitoreo y Logs**

### **Ver Logs:**
```bash
# Logs en tiempo real
docker-compose logs -f

# Logs específicos del servicio
docker-compose logs -f app

# Últimas 50 líneas
docker-compose logs --tail=50
```

### **Estado de Servicios:**
```bash
# Ver servicios corriendo
docker-compose ps

# Estadísticas de recursos
docker stats
```

## 🔒 **Backup y Recuperación**

### **Backup Automático:**
- Se crea automáticamente antes de cada despliegue
- Ubicación: `./backups/games-backup-YYYYMMDD-HHMMSS.tar.gz`

### **Backup Manual:**
```bash
# Crear backup inmediato
./docker-scripts/manage-volumes.sh backup
```

### **Restauración:**
```bash
# Restaurar desde backup específico
./docker-scripts/manage-volumes.sh restore backups/games-backup-20241203-142530.tar.gz
```

### **Migración de Datos:**
```bash
# 1. En servidor origen - crear backup
./docker-scripts/manage-volumes.sh backup

# 2. Copiar archivo de backup al servidor destino
scp backups/games-backup-*.tar.gz user@new-server:/path/to/project/backups/

# 3. En servidor destino - restaurar backup
./docker-scripts/manage-volumes.sh restore backups/games-backup-*.tar.gz
```

## ⚠️ **Consideraciones Importantes**

### **Persistencia Garantizada:**
- ✅ Los juegos **NO se pierden** al reiniciar contenedores
- ✅ Los juegos **NO se pierden** al actualizar la aplicación
- ✅ Los juegos **NO se pierden** al reconstruir la imagen Docker

### **Espacio en Disco:**
- Monitorea el espacio disponible regularmente
- Los juegos Unity WebGL pueden ocupar varios MB cada uno
- Usa `docker system df` para ver uso de espacio

### **Backups Regulares:**
- Configura backups automáticos en producción
- Guarda backups en ubicación externa (S3, etc.)
- Prueba la restauración periódicamente

## 🌐 **Acceso a la Aplicación**

### **URLs:**
- **Local**: http://localhost:8081
- **Producción**: Configurado via `VIRTUAL_HOST` en docker-compose.yml

### **API Endpoints:**
- **Health Check**: `/api/health`
- **Juegos**: `/api/games/test`
- **Upload**: `/api/games/upload`

## 🛠️ **Solución de Problemas**

### **Contenedor no inicia:**
```bash
# Ver logs detallados
docker-compose logs

# Reconstruir imagen
docker-compose build --no-cache
docker-compose up -d
```

### **Juegos no se guardan:**
```bash
# Verificar volúmenes
./docker-scripts/manage-volumes.sh status

# Verificar permisos
docker run --rm -v gamecraft_games_data:/data alpine ls -la /data
```

### **Problemas de conectividad:**
```bash
# Verificar puertos
docker-compose ps
netstat -tlnp | grep 8081

# Verificar logs de red
docker-compose logs | grep -i error
```

### **Limpiar y empezar de nuevo:**
```bash
# CUIDADO: Esto elimina TODOS los datos
docker-compose down
./docker-scripts/manage-volumes.sh clean
./docker-scripts/deploy.sh
```

## 📝 **Comandos Útiles**

```bash
# Reiniciar solo la aplicación
docker-compose restart app

# Actualizar sin perder datos
docker-compose build --no-cache
docker-compose up -d

# Entrar al contenedor
docker-compose exec app sh

# Ver uso de recursos
docker stats $(docker-compose ps -q)

# Limpiar imágenes no utilizadas
docker image prune -f
```

---

## ✅ **Resumen de Beneficios**

1. **🔒 Persistencia Total**: Los juegos nunca se pierden
2. **📦 Backups Automáticos**: Protección antes de cada actualización  
3. **🚀 Despliegue Simplificado**: Un solo comando para todo
4. **📊 Monitoreo Fácil**: Scripts para gestión y estado
5. **🔧 Recuperación Rápida**: Restauración desde backups en minutos
6. **⚡ Cero Downtime**: Actualizaciones sin pérdida de datos

¡La configuración Docker está lista para producción! 🎮✨
