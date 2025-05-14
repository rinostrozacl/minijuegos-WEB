FROM node:18-alpine

WORKDIR /app

# Copiar package.json y package-lock.json primero para aprovechar la caché de Docker
COPY package*.json ./

# Instalar dependencias (incluyendo devDependencies para construir)
RUN npm ci

# Copiar el resto de los archivos
COPY . .

# Configurar variables de entorno
ENV PORT=8080
ENV HOST=0.0.0.0
ENV NODE_ENV=production

# Construir la aplicación
RUN npm run build

# Verificar que el archivo existe
RUN ls -la && ls -la .output && ls -la .output/server

# Exponer el puerto
EXPOSE 8080

# Configurar el directorio de trabajo para el directorio de salida
WORKDIR /app/.output

# Iniciar la aplicación
CMD ["node", "server/index.mjs"] 