#!/bin/bash

# Script de despliegue para GameCraft2026
# Maneja la construcción, volúmenes persistentes y despliegue

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

PROJECT_NAME="gamecraft"
COMPOSE_FILE="docker-compose.yml"

print_header() {
    echo -e "${BLUE}"
    echo "=============================================="
    echo "    GameCraft2026 - Script de Despliegue"
    echo "=============================================="
    echo -e "${NC}"
}

check_requirements() {
    echo -e "${BLUE}=== Verificando Requisitos ===${NC}"
    
    # Verificar Docker
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}Error: Docker no está instalado${NC}"
        exit 1
    fi
    echo -e "${GREEN}✓${NC} Docker disponible"
    
    # Verificar Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        echo -e "${RED}Error: Docker Compose no está instalado${NC}"
        exit 1
    fi
    echo -e "${GREEN}✓${NC} Docker Compose disponible"
    
    # Verificar OpenSSL (necesario para certificados HTTPS)
    if ! command -v openssl &> /dev/null; then
        echo -e "${YELLOW}⚠${NC} OpenSSL no está disponible"
        echo "  Los certificados SSL no se podrán generar automáticamente"
        echo "  El sistema funcionará sin HTTPS directo para uploads"
    else
        echo -e "${GREEN}✓${NC} OpenSSL disponible"
    fi
    
    # Verificar archivo compose
    if [ ! -f "$COMPOSE_FILE" ]; then
        echo -e "${RED}Error: $COMPOSE_FILE no encontrado${NC}"
        exit 1
    fi
    echo -e "${GREEN}✓${NC} Archivo docker-compose.yml encontrado"
    
    # Verificar scripts necesarios
    if [ ! -f "docker-scripts/generate-ssl-certs.sh" ]; then
        echo -e "${YELLOW}⚠${NC} Script de generación SSL no encontrado"
        echo "  HTTPS directo no estará disponible"
    else
        echo -e "${GREEN}✓${NC} Script de generación SSL encontrado"
    fi
    
    # Verificar archivo de credenciales
    if [ ! -f "minijuegos-firebasekey.json" ]; then
        echo -e "${YELLOW}⚠${NC} Archivo de credenciales Firebase no encontrado"
        echo "  Asegúrate de que esté presente para producción"
    else
        echo -e "${GREEN}✓${NC} Credenciales Firebase encontradas"
    fi
}

setup_volumes() {
    echo -e "${BLUE}=== Configurando Volúmenes Persistentes ===${NC}"
    
    # Ejecutar script de gestión de volúmenes
    ./docker-scripts/manage-volumes.sh create
    
    echo -e "${GREEN}✓${NC} Volúmenes configurados"
}

backup_existing() {
    echo -e "${BLUE}=== Creando Backup de Seguridad ===${NC}"
    
    # Verificar si hay juegos existentes
    if docker volume inspect "${PROJECT_NAME}_games_data" &> /dev/null; then
        echo "Creando backup de juegos existentes..."
        ./docker-scripts/manage-volumes.sh backup
        echo -e "${GREEN}✓${NC} Backup creado"
    else
        echo "No hay datos existentes para respaldar"
    fi
}

setup_ssl_certificates() {
    echo -e "${BLUE}=== Configurando Certificados SSL ===${NC}"
    
    # Verificar si ya existen certificados
    if [ -f "certs/localhost-cert.pem" ] && [ -f "certs/localhost-key.pem" ]; then
        echo "Certificados SSL ya existen"
        
        # Verificar si están próximos a vencer (últimos 30 días)
        if openssl x509 -checkend 2592000 -noout -in certs/localhost-cert.pem > /dev/null 2>&1; then
            echo -e "${GREEN}✓${NC} Certificados SSL válidos y vigentes"
            return 0
        else
            echo -e "${YELLOW}⚠${NC} Certificados próximos a vencer, regenerando..."
        fi
    else
        echo "Generando certificados SSL para HTTPS directo..."
    fi
    
    # Hacer ejecutable el script de generación de certificados
    chmod +x docker-scripts/generate-ssl-certs.sh
    
    # Ejecutar generación de certificados
    if ./docker-scripts/generate-ssl-certs.sh; then
        echo -e "${GREEN}✓${NC} Certificados SSL generados correctamente"
    else
        echo -e "${RED}✗${NC} Error al generar certificados SSL"
        echo "El sistema funcionará pero sin HTTPS directo para uploads"
    fi
}

build_and_deploy() {
    echo -e "${BLUE}=== Construyendo y Desplegando ===${NC}"
    
    # Detener servicios existentes
    echo "Deteniendo servicios existentes..."
    docker-compose down || true
    
    # Verificar y limpiar volúmenes con configuración incompatible
    echo "Verificando configuración de volúmenes..."
    if docker volume inspect "minijuegos-web_games_data" &> /dev/null; then
        echo "Detectado volumen con configuración antigua, recreando..."
        # Crear backup del volumen existente antes de eliminarlo
        if docker run --rm -v "minijuegos-web_games_data":/source alpine test -d /source && [ "$(docker run --rm -v "minijuegos-web_games_data":/source alpine ls -A /source)" ]; then
            echo "Creando backup de emergencia del volumen existente..."
            BACKUP_DIR="./backups"
            EMERGENCY_BACKUP="emergency-games-backup-$(date +%Y%m%d-%H%M%S).tar.gz"
            mkdir -p "$BACKUP_DIR"
            docker run --rm \
                -v "minijuegos-web_games_data":/source:ro \
                -v "$(pwd)/$BACKUP_DIR":/backup \
                alpine tar czf "/backup/$EMERGENCY_BACKUP" -C /source . 2>/dev/null || true
            echo "Backup de emergencia creado: $BACKUP_DIR/$EMERGENCY_BACKUP"
        fi
        
        # Eliminar volumen con configuración incompatible
        docker volume rm "minijuegos-web_games_data" || true
        echo "Volumen anterior eliminado"
    fi
    
    # Verificar volumen SSL también
    if docker volume inspect "minijuegos-web_ssl_certs" &> /dev/null; then
        echo "Verificando configuración del volumen SSL..."
        docker volume rm "minijuegos-web_ssl_certs" || true
        echo "Volumen SSL anterior eliminado"
    fi
    
    # Construir imagen
    echo "Construyendo imagen Docker..."
    docker-compose build --no-cache
    
    # Iniciar servicios
    echo "Iniciando servicios..."
    docker-compose up -d
    
    echo -e "${GREEN}✓${NC} Despliegue completado"
}

verify_deployment() {
    echo -e "${BLUE}=== Verificando Despliegue ===${NC}"
    
    # Esperar que el servicio esté listo
    echo "Esperando que el servicio esté listo..."
    sleep 15
    
    # Verificar que el contenedor esté corriendo
    if docker-compose ps | grep -q "Up"; then
        echo -e "${GREEN}✓${NC} Contenedor ejecutándose"
    else
        echo -e "${RED}✗${NC} Error: Contenedor no está ejecutándose"
        echo "Logs del contenedor:"
        docker-compose logs --tail=20
        exit 1
    fi
    
    # Verificar conectividad HTTP principal (puerto 8081)
    echo "Verificando conectividad HTTP principal (puerto 8081)..."
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:8081/api/health | grep -q "200"; then
        echo -e "${GREEN}✓${NC} API HTTP respondiendo correctamente"
    else
        echo -e "${YELLOW}⚠${NC} API HTTP no responde en puerto 8081"
    fi
    
    # Verificar conectividad HTTPS directo (puerto 8443)
    echo "Verificando HTTPS directo (puerto 8443)..."
    if curl -k -s -o /dev/null -w "%{http_code}" https://localhost:8443/api/health | grep -q "200"; then
        echo -e "${GREEN}✓${NC} API HTTPS directo respondiendo correctamente"
    else
        echo -e "${YELLOW}⚠${NC} API HTTPS directo no responde en puerto 8443"
        echo "  Esto es normal si los certificados SSL no se generaron"
    fi
    
    # Verificar puertos expuestos
    echo "Verificando puertos expuestos..."
    EXPOSED_PORTS=$(docker-compose port app 3000 2>/dev/null || echo "No encontrado")
    if [ "$EXPOSED_PORTS" != "No encontrado" ]; then
        echo -e "${GREEN}✓${NC} Puerto HTTP principal expuesto: $EXPOSED_PORTS"
    fi
    
    # Intentar verificar puerto HTTPS
    HTTPS_PORT=$(docker-compose port app 3443 2>/dev/null || echo "No encontrado")
    if [ "$HTTPS_PORT" != "No encontrado" ]; then
        echo -e "${GREEN}✓${NC} Puerto HTTPS directo expuesto: $HTTPS_PORT"
    else
        echo -e "${YELLOW}⚠${NC} Puerto HTTPS directo no detectado"
    fi
    
    # Mostrar estado de volúmenes
    echo ""
    ./docker-scripts/manage-volumes.sh status
}

show_info() {
    echo -e "${BLUE}=== Información del Despliegue ===${NC}"
    echo ""
    echo "🌐 Aplicación disponible en:"
    echo "   http://localhost:8081    # Navegación web principal"
    echo "   https://localhost:8443   # HTTPS directo para uploads"
    echo ""
    echo "🎯 Sistema de Upload Simplificado:"
    echo "   ✅ Solo HTTPS directo para TODOS los archivos"
    echo "   ✅ Sin Firebase Storage, sin chunks, sin límites"
    echo "   ✅ Bypass completo de Cloudflare para uploads"
    echo ""
    echo "📊 Gestión:"
    echo "   docker-compose logs -f          # Ver logs en tiempo real"
    echo "   docker-compose restart          # Reiniciar servicios"
    echo "   docker-compose down             # Detener servicios"
    echo ""
    echo "🔒 Certificados SSL:"
    echo "   ./docker-scripts/generate-ssl-certs.sh    # Regenerar certificados"
    echo "   openssl x509 -in certs/localhost-cert.pem -text -noout | grep -A 2 \"Validity\"  # Verificar vigencia"
    echo ""
    echo "💾 Volúmenes:"
    echo "   ./docker-scripts/manage-volumes.sh status    # Estado de volúmenes"
    echo "   ./docker-scripts/manage-volumes.sh backup    # Crear backup"
    echo "   ./docker-scripts/manage-volumes.sh list-games # Listar juegos"
    echo ""
    echo "🔧 Archivos importantes:"
    echo "   - Juegos: /public/games/ (sistema directo)"
    echo "   - Certificados SSL: /certs/"
    echo "   - Logs: docker-compose logs"
    echo "   - Config: docker-compose.yml"
    echo ""
    echo "🚀 URLs de Producción:"
    echo "   - Web: https://gamecraft.cl"
    echo "   - Uploads: https://192.95.7.30:8443"
    echo ""
}

main() {
    print_header
    
    echo "Iniciando despliegue de GameCraft2026..."
    echo ""
    
    check_requirements
    echo ""
    
    setup_volumes
    echo ""
    
    # Crear backup automáticamente si hay datos existentes
    if docker volume inspect "${PROJECT_NAME}_games_data" &> /dev/null; then
        echo -e "${YELLOW}Se detectaron datos existentes. Creando backup automáticamente...${NC}"
        backup_existing
        echo ""
    fi
    
    setup_ssl_certificates
    echo ""
    
    build_and_deploy
    echo ""
    
    verify_deployment
    echo ""
    
    show_info
    
    echo -e "${GREEN}🎉 Despliegue completado exitosamente!${NC}"
}

# Ejecutar función principal
main "$@"
