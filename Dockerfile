FROM node:18-alpine

# Crear y configurar directorio de trabajo
WORKDIR /workspace

# Copiar archivos de configuración para instalación de dependencias
COPY package*.json ./
COPY yarn.lock ./

# Instalar dependencias
RUN yarn install --production=false

# Copiar el resto de archivos
COPY . .

# Construir la aplicación
RUN yarn build

# Definir variables de entorno
ENV PORT=8080
ENV HOST=0.0.0.0
ENV NODE_ENV=production

# Verificar la estructura de directorios
RUN echo "Contenido de los directorios:" && \
    ls -la && \
    ls -la .output && \
    ls -la .output/server

# Exponer el puerto
EXPOSE 8080

# Comando para iniciar el servidor
CMD ["node", ".output/server/index.mjs"] 