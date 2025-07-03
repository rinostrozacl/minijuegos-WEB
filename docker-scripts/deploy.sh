#!/bin/bash

# Script de despliegue para GameCraft2025
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
    echo "    GameCraft2025 - Script de Despliegue"
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
    
    # Verificar archivo compose
    if [ ! -f "$COMPOSE_FILE" ]; then
        echo -e "${RED}Error: $COMPOSE_FILE no encontrado${NC}"
        exit 1
    fi
    echo -e "${GREEN}✓${NC} Archivo docker-compose.yml encontrado"
    
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

build_and_deploy() {
    echo -e "${BLUE}=== Construyendo y Desplegando ===${NC}"
    
    # Detener servicios existentes
    echo "Deteniendo servicios existentes..."
    docker-compose down || true
    
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
    sleep 10
    
    # Verificar que el contenedor esté corriendo
    if docker-compose ps | grep -q "Up"; then
        echo -e "${GREEN}✓${NC} Contenedor ejecutándose"
    else
        echo -e "${RED}✗${NC} Error: Contenedor no está ejecutándose"
        echo "Logs del contenedor:"
        docker-compose logs --tail=20
        exit 1
    fi
    
    # Verificar conectividad
    echo "Verificando conectividad..."
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:8081/api/health | grep -q "200"; then
        echo -e "${GREEN}✓${NC} API respondiendo correctamente"
    else
        echo -e "${YELLOW}⚠${NC} API no responde (puede estar iniciando)"
    fi
    
    # Mostrar estado de volúmenes
    echo ""
    ./docker-scripts/manage-volumes.sh status
}

show_info() {
    echo -e "${BLUE}=== Información del Despliegue ===${NC}"
    echo ""
    echo "🌐 Aplicación disponible en:"
    echo "   http://localhost:8081"
    echo ""
    echo "📊 Gestión:"
    echo "   docker-compose logs -f          # Ver logs en tiempo real"
    echo "   docker-compose restart          # Reiniciar servicios"
    echo "   docker-compose down             # Detener servicios"
    echo ""
    echo "💾 Volúmenes:"
    echo "   ./docker-scripts/manage-volumes.sh status    # Estado de volúmenes"
    echo "   ./docker-scripts/manage-volumes.sh backup    # Crear backup"
    echo "   ./docker-scripts/manage-volumes.sh list-games # Listar juegos"
    echo ""
    echo "🔧 Archivos importantes:"
    echo "   - Juegos: Volumen Docker persistente"
    echo "   - Logs: docker-compose logs"
    echo "   - Config: docker-compose.yml"
    echo ""
}

main() {
    print_header
    
    echo "Iniciando despliegue de GameCraft2025..."
    echo ""
    
    check_requirements
    echo ""
    
    setup_volumes
    echo ""
    
    # Preguntar si crear backup
    if docker volume inspect "${PROJECT_NAME}_games_data" &> /dev/null; then
        echo -e "${YELLOW}Se detectaron datos existentes.${NC}"
        read -p "¿Crear backup antes del despliegue? (Y/n): " create_backup
        if [[ ! $create_backup =~ ^[Nn]$ ]]; then
            backup_existing
            echo ""
        fi
    fi
    
    build_and_deploy
    echo ""
    
    verify_deployment
    echo ""
    
    show_info
    
    echo -e "${GREEN}🎉 Despliegue completado exitosamente!${NC}"
}

# Ejecutar función principal
main "$@"
