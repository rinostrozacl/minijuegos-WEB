FROM node:20-alpine

WORKDIR /app

# Instalar dependencias necesarias
RUN apk add --no-cache bash git curl iputils

# Copiar archivos de la aplicación
COPY . .

# Crear directorios para volúmenes persistentes
RUN mkdir -p /app/public/games && \
    mkdir -p /app/certs && \
    mkdir -p /app/temp/chunks && \
    chmod 755 /app/public/games && \
    chmod 755 /app/certs && \
    chmod 755 /app/temp

# Crear archivo README para la carpeta de juegos si no existe
RUN if [ ! -f /app/public/games/README.md ]; then \
    echo "# Juegos Unity WebGL" > /app/public/games/README.md && \
    echo "" >> /app/public/games/README.md && \
    echo "Esta carpeta contiene los juegos Unity WebGL subidos por los usuarios." >> /app/public/games/README.md && \
    echo "Cada juego se almacena en su propia subcarpeta con el ID de la temática." >> /app/public/games/README.md && \
    echo "" >> /app/public/games/README.md && \
    echo "## Estructura:" >> /app/public/games/README.md && \
    echo "- \`{theme-id}/\` - Carpeta del juego" >> /app/public/games/README.md && \
    echo "  - \`index.html\` - Archivo principal del juego" >> /app/public/games/README.md && \
    echo "  - \`Build/\` - Archivos compilados de Unity" >> /app/public/games/README.md && \
    echo "  - \`TemplateData/\` - Recursos de la plantilla" >> /app/public/games/README.md; \
    fi

# Instalar dependencias
RUN yarn install

# Variables de entorno públicas para la compilación
ENV NUXT_PUBLIC_FIREBASE_API_KEY="AIzaSyAeufIvrH9jtXx0B8PsstJ8KemRsgKtqwQ"
ENV NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN="minijuegos-1012b.firebaseapp.com"
ENV NUXT_PUBLIC_FIREBASE_PROJECT_ID="minijuegos-1012b"
ENV NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET="minijuegos-1012b.firebasestorage.app"
ENV NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="925704347111"
ENV NUXT_PUBLIC_FIREBASE_APP_ID="1:925704347111:web:73929f24b1f18a4e6ff142"
ENV NUXT_PUBLIC_FIREBASE_MEASUREMENT_ID="G-4T46PP91S8"

# Compilar la aplicación
RUN yarn build

# Variables de entorno para el servidor
ENV NUXT_HOST=0.0.0.0
ENV NUXT_PORT=3000
ENV NODE_ENV=production

# Resend y Firebase Admin se configuran en runtime (Coolify), no en la imagen.
# FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY
# RESEND_API_KEY, RESEND_FROM_EMAIL

# Exponer puerto
EXPOSE 3000

# Verificar conectividad a servicios externos durante la construcción
RUN echo "Verificando conectividad a api.resend.com..." && \
    ping -c 2 api.resend.com || echo "No se pudo contactar a api.resend.com, pero continuaremos con la construcción"

# Comando para iniciar la aplicación
CMD ["npm", "start"] 