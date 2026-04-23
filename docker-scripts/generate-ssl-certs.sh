#!/bin/bash

# Script para generar certificados SSL para el servidor con IP específica
# Funciona para IP 192.95.7.30 y localhost para desarrollo

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_header() {
    echo -e "${BLUE}"
    echo "=============================================="
    echo "    Generador de Certificados SSL"
    echo "    GameCraft2026 - Upload HTTPS Directo"
    echo "=============================================="
    echo -e "${NC}"
}

print_header

# Variables
CERT_DIR="certs"
SERVER_IP="192.95.7.30"
KEY_FILE="${CERT_DIR}/localhost-key.pem"
CERT_FILE="${CERT_DIR}/localhost-cert.pem"

echo -e "${YELLOW}Configuración:${NC}"
echo "  📁 Directorio: ${CERT_DIR}"
echo "  🌐 IP Servidor: ${SERVER_IP}"
echo "  🔑 Clave: ${KEY_FILE}"
echo "  📜 Certificado: ${CERT_FILE}"
echo ""

# Crear directorio si no existe
if [ ! -d "$CERT_DIR" ]; then
    echo -e "${BLUE}📁 Creando directorio de certificados...${NC}"
    mkdir -p "$CERT_DIR"
fi

# Verificar si ya existen certificados
if [ -f "$KEY_FILE" ] && [ -f "$CERT_FILE" ]; then
    echo -e "${YELLOW}⚠️  Los certificados ya existen.${NC}"
    read -p "¿Deseas regenerarlos? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${GREEN}✅ Manteniendo certificados existentes.${NC}"
        exit 0
    fi
    echo -e "${YELLOW}🔄 Regenerando certificados...${NC}"
fi

# Verificar que OpenSSL está disponible
if ! command -v openssl &> /dev/null; then
    echo -e "${RED}❌ Error: OpenSSL no está instalado${NC}"
    echo "   Instala OpenSSL:"
    echo "   - Ubuntu/Debian: sudo apt-get install openssl"
    echo "   - CentOS/RHEL: sudo yum install openssl"
    echo "   - macOS: brew install openssl"
    exit 1
fi

echo -e "${GREEN}✅ OpenSSL encontrado${NC}"

# Crear archivo de configuración para el certificado
CONFIG_FILE="${CERT_DIR}/openssl.conf"
echo -e "${BLUE}📝 Creando configuración OpenSSL...${NC}"

cat > "$CONFIG_FILE" << EOF
[req]
default_bits = 2048
prompt = no
default_md = sha256
distinguished_name = dn
req_extensions = v3_req

[dn]
C=CL
ST=Chile
L=Santiago
O=GameCraft2026
OU=Upload Service
CN=localhost

[v3_req]
subjectAltName = @alt_names

[alt_names]
DNS.1 = localhost
DNS.2 = *.localhost
IP.1 = 127.0.0.1
IP.2 = ${SERVER_IP}
EOF

echo -e "${BLUE}🔐 Generando certificado SSL...${NC}"

# Generar clave privada y certificado
openssl req -x509 -newkey rsa:2048 -keyout "$KEY_FILE" -out "$CERT_FILE" \
    -days 365 -nodes -config "$CONFIG_FILE" -extensions v3_req

# Verificar que se crearon correctamente
if [ -f "$KEY_FILE" ] && [ -f "$CERT_FILE" ]; then
    echo -e "${GREEN}✅ Certificados generados exitosamente${NC}"
    
    # Mostrar información del certificado
    echo -e "${BLUE}📋 Información del certificado:${NC}"
    openssl x509 -in "$CERT_FILE" -text -noout | grep -A 1 "Subject:"
    openssl x509 -in "$CERT_FILE" -text -noout | grep -A 5 "Subject Alternative Name"
    
    # Configurar permisos
    chmod 644 "$CERT_FILE"
    chmod 600 "$KEY_FILE"
    
    echo -e "${BLUE}🔧 Permisos configurados:${NC}"
    ls -la "$CERT_DIR"/*.pem
    
    # Limpiar archivo temporal
    rm -f "$CONFIG_FILE"
    
    echo ""
    echo -e "${GREEN}🎉 ¡Certificados SSL listos!${NC}"
    echo ""
    echo -e "${YELLOW}📋 Próximos pasos:${NC}"
    echo "  1. Reiniciar el contenedor Docker"
    echo "  2. El servidor HTTPS estará disponible en:"
    echo "     🔒 https://${SERVER_IP}:8443"
    echo "     🔒 https://localhost:8443 (desarrollo)"
    echo ""
    echo -e "${YELLOW}⚠️  Nota de seguridad:${NC}"
    echo "  Los navegadores mostrarán advertencia porque es certificado autofirmado."
    echo "  Es normal y seguro para desarrollo/testing."
    
else
    echo -e "${RED}❌ Error: No se pudieron generar los certificados${NC}"
    exit 1
fi 