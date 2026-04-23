#!/bin/bash

# Script para gestionar volúmenes persistentes de GameCraft2026
# Uso: ./manage-volumes.sh [comando]

set -e

PROJECT_NAME="gamecraft"
GAMES_VOLUME="${PROJECT_NAME}_games_data"
SSL_VOLUME="${PROJECT_NAME}_ssl_certs"

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_help() {
    echo -e "${BLUE}GameCraft2026 - Gestión de Volúmenes Docker${NC}"
    echo ""
    echo "Uso: $0 [comando]"
    echo ""
    echo "Comandos disponibles:"
    echo "  status       - Mostrar estado de volúmenes"
    echo "  create       - Crear volúmenes si no existen"
    echo "  backup       - Crear backup de juegos"
    echo "  restore      - Restaurar backup de juegos"
    echo "  list-games   - Listar juegos almacenados"
    echo "  clean        - Limpiar volúmenes (¡PELIGROSO!)"
    echo "  help         - Mostrar esta ayuda"
}

check_docker() {
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}Error: Docker no está instalado${NC}"
        exit 1
    fi
}

volume_exists() {
    docker volume inspect "$1" &> /dev/null
}

show_status() {
    echo -e "${BLUE}=== Estado de Volúmenes ===${NC}"
    echo ""
    
    if volume_exists "$GAMES_VOLUME"; then
        echo -e "${GREEN}✓${NC} Volumen de juegos: $GAMES_VOLUME"
        GAMES_SIZE=$(docker run --rm -v "$GAMES_VOLUME":/data alpine du -sh /data 2>/dev/null | cut -f1 || echo "N/A")
        echo "  Tamaño: $GAMES_SIZE"
    else
        echo -e "${RED}✗${NC} Volumen de juegos: $GAMES_VOLUME (no existe)"
    fi
    
    if volume_exists "$SSL_VOLUME"; then
        echo -e "${GREEN}✓${NC} Volumen SSL: $SSL_VOLUME"
    else
        echo -e "${RED}✗${NC} Volumen SSL: $SSL_VOLUME (no existe)"
    fi
    
    echo ""
    echo -e "${BLUE}=== Información del Sistema ===${NC}"
    echo "Espacio disponible en Docker:"
    docker system df
}

create_volumes() {
    echo -e "${BLUE}=== Creando Volúmenes ===${NC}"
    
    if ! volume_exists "$GAMES_VOLUME"; then
        echo "Creando volumen de juegos..."
        docker volume create "$GAMES_VOLUME"
        echo -e "${GREEN}✓${NC} Volumen de juegos creado"
    else
        echo -e "${YELLOW}!${NC} Volumen de juegos ya existe"
    fi
    
    if ! volume_exists "$SSL_VOLUME"; then
        echo "Creando volumen SSL..."
        docker volume create "$SSL_VOLUME"
        echo -e "${GREEN}✓${NC} Volumen SSL creado"
    else
        echo -e "${YELLOW}!${NC} Volumen SSL ya existe"
    fi
}

backup_games() {
    if ! volume_exists "$GAMES_VOLUME"; then
        echo -e "${RED}Error: Volumen de juegos no existe${NC}"
        exit 1
    fi
    
    BACKUP_DIR="./backups"
    BACKUP_FILE="games-backup-$(date +%Y%m%d-%H%M%S).tar.gz"
    
    mkdir -p "$BACKUP_DIR"
    
    echo -e "${BLUE}=== Creando Backup ===${NC}"
    echo "Archivo: $BACKUP_DIR/$BACKUP_FILE"
    
    docker run --rm \
        -v "$GAMES_VOLUME":/source:ro \
        -v "$(pwd)/$BACKUP_DIR":/backup \
        alpine tar czf "/backup/$BACKUP_FILE" -C /source .
    
    echo -e "${GREEN}✓${NC} Backup creado exitosamente"
    echo "Ubicación: $BACKUP_DIR/$BACKUP_FILE"
}

restore_games() {
    if [ -z "$2" ]; then
        echo -e "${RED}Error: Especifica el archivo de backup${NC}"
        echo "Uso: $0 restore <archivo-backup>"
        exit 1
    fi
    
    BACKUP_FILE="$2"
    
    if [ ! -f "$BACKUP_FILE" ]; then
        echo -e "${RED}Error: Archivo de backup no encontrado: $BACKUP_FILE${NC}"
        exit 1
    fi
    
    echo -e "${YELLOW}¡ADVERTENCIA!${NC} Esto sobrescribirá todos los juegos existentes"
    read -p "¿Continuar? (y/N): " confirm
    
    if [[ ! $confirm =~ ^[Yy]$ ]]; then
        echo "Operación cancelada"
        exit 0
    fi
    
    echo -e "${BLUE}=== Restaurando Backup ===${NC}"
    
    # Crear volumen si no existe
    if ! volume_exists "$GAMES_VOLUME"; then
        docker volume create "$GAMES_VOLUME"
    fi
    
    # Limpiar volumen
    docker run --rm -v "$GAMES_VOLUME":/data alpine sh -c "rm -rf /data/*"
    
    # Restaurar backup
    docker run --rm \
        -v "$GAMES_VOLUME":/target \
        -v "$(dirname $(realpath $BACKUP_FILE))":/backup:ro \
        alpine tar xzf "/backup/$(basename $BACKUP_FILE)" -C /target
    
    echo -e "${GREEN}✓${NC} Backup restaurado exitosamente"
}

list_games() {
    if ! volume_exists "$GAMES_VOLUME"; then
        echo -e "${RED}Error: Volumen de juegos no existe${NC}"
        exit 1
    fi
    
    echo -e "${BLUE}=== Juegos Almacenados ===${NC}"
    
    docker run --rm -v "$GAMES_VOLUME":/data alpine sh -c "
        if [ -d /data ] && [ \"\$(ls -A /data 2>/dev/null)\" ]; then
            echo 'Juegos encontrados:'
            for game in /data/*/; do
                if [ -d \"\$game\" ]; then
                    game_name=\$(basename \"\$game\")
                    size=\$(du -sh \"\$game\" 2>/dev/null | cut -f1 || echo 'N/A')
                    has_index=\$([ -f \"\$game/index.html\" ] && echo '✓' || echo '✗')
                    echo \"  \$game_name (\$size) - index.html: \$has_index\"
                fi
            done
        else
            echo 'No hay juegos almacenados'
        fi
    "
}

clean_volumes() {
    echo -e "${RED}¡PELIGRO!${NC} Esto eliminará TODOS los volúmenes y datos"
    echo "Volúmenes que se eliminarán:"
    echo "  - $GAMES_VOLUME (todos los juegos)"
    echo "  - $SSL_VOLUME (certificados SSL)"
    echo ""
    read -p "Escribe 'DELETE' para confirmar: " confirm
    
    if [ "$confirm" != "DELETE" ]; then
        echo "Operación cancelada"
        exit 0
    fi
    
    echo -e "${BLUE}=== Eliminando Volúmenes ===${NC}"
    
    if volume_exists "$GAMES_VOLUME"; then
        docker volume rm "$GAMES_VOLUME"
        echo -e "${GREEN}✓${NC} Volumen de juegos eliminado"
    fi
    
    if volume_exists "$SSL_VOLUME"; then
        docker volume rm "$SSL_VOLUME"
        echo -e "${GREEN}✓${NC} Volumen SSL eliminado"
    fi
    
    echo -e "${GREEN}✓${NC} Limpieza completada"
}

# Verificar Docker
check_docker

# Procesar comando
case "${1:-help}" in
    "status")
        show_status
        ;;
    "create")
        create_volumes
        ;;
    "backup")
        backup_games
        ;;
    "restore")
        restore_games "$@"
        ;;
    "list-games")
        list_games
        ;;
    "clean")
        clean_volumes
        ;;
    "help"|*)
        print_help
        ;;
esac
