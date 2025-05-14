FROM node:18-alpine

# Crear y configurar directorio de trabajo
WORKDIR /workspace

# Copiar archivos de configuración para instalación de dependencias
COPY package*.json ./
COPY yarn.lock ./
COPY apphosting.yaml ./

# Instalar dependencias (uso de yarn como lo hace Firebase App Hosting)
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

# Crear el directorio output sin punto y copiar los archivos allí
# (Firebase busca en /workspace/output/server/index.mjs)
RUN mkdir -p /workspace/output/server && \
    cp -r .output/server/* /workspace/output/server/ && \
    ls -la /workspace/output/server

# Crear enlaces simbólicos y establecer permisos
RUN ln -sf /workspace/.output/server /workspace/server && \
    ln -sf /workspace/.output/server/index.mjs /workspace/server.mjs && \
    chmod +x start.js index.js

# Exponer el puerto
EXPOSE 8080

# Comando para iniciar el servidor (usando el script de inicio adaptado para Firebase)
CMD ["node", "start.js"] 