FROM node:18-alpine

WORKDIR /app

# Copiar package.json y package-lock.json primero para aprovechar la caché de Docker
COPY package*.json ./
RUN npm ci

# Copiar el resto de los archivos
COPY . .

# Configurar variables de entorno
ENV PORT=8080
ENV HOST=0.0.0.0
ENV NODE_ENV=production

# Asegurarse de que las dependencias de desarrollo estén instaladas para la compilación
RUN npm run build

# Hacer ejecutable el script de entrada
RUN chmod +x ./entrypoint.sh

# Exponer el puerto
EXPOSE 8080

# Usar el script entrypoint para iniciar la aplicación
ENTRYPOINT ["./entrypoint.sh"] 