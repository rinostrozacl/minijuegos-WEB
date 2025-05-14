FROM node:18-alpine

WORKDIR /app

# Copiar package.json y package-lock.json primero para aprovechar la caché de Docker
COPY package*.json ./

# Asegurarse de usar npm explícitamente (no yarn)
RUN npm ci

# Copiar el resto de los archivos
COPY . .

# Configurar variables de entorno
ENV PORT=8080
ENV HOST=0.0.0.0
ENV NODE_ENV=production

# Asegurarse de que las dependencias de desarrollo estén instaladas para la compilación
RUN npm run build

# Crear el directorio de salida si no existe
RUN ls -la .output || echo "Output directory not found"

# Mostrar el contenido del directorio output si existe
RUN if [ -d ".output" ]; then ls -la .output/; fi
RUN if [ -d ".output/server" ]; then ls -la .output/server/; fi

# Exponer el puerto
EXPOSE 8080

# Usar directamente el comando node para iniciar la aplicación
CMD ["node", ".output/server/index.mjs"] 