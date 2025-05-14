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

# Crear servidor HTTP mínimo para depuración
RUN echo 'import http from "http"; \
    const server = http.createServer((req, res) => { \
    res.writeHead(200, {"Content-Type": "text/html"}); \
    res.end(`<html><head><title>Depuración</title></head><body> \
    <h1>Diagnóstico del Servidor</h1> \
    <h2>Entorno</h2> \
    <pre>PORT=${process.env.PORT}\nHOST=${process.env.HOST}\nNODE_ENV=${process.env.NODE_ENV}</pre> \
    <h2>Directorio actual</h2> \
    <pre>${process.cwd()}</pre> \
    <h2>Estructura de archivos</h2> \
    <pre>ls -la: ${require("child_process").execSync("ls -la").toString()}</pre> \
    <h2>Contenido .output</h2> \
    <pre>ls -la .output: ${require("fs").existsSync(".output") ? require("child_process").execSync("ls -la .output").toString() : "No existe"}</pre> \
    </body></html>`); \
    }); \
    server.listen(process.env.PORT || 8080, process.env.HOST || "0.0.0.0", () => { \
    console.log(`Servidor diagnóstico en http://${process.env.HOST || "0.0.0.0"}:${process.env.PORT || 8080}`); \
    }); \
    export default server;' > diagnosis.mjs

# Construir la aplicación
RUN yarn build

# Definir variables de entorno
ENV PORT=8080
ENV HOST=0.0.0.0
ENV NODE_ENV=production
ENV NITRO_DEBUG=1
ENV DEBUG=true

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

# Crear directorio public y copiar archivos
RUN mkdir -p /workspace/output/public && \
    cp -r .output/public/* /workspace/output/public/ || true

# Crear enlaces simbólicos y establecer permisos
RUN ln -sf /workspace/.output/server /workspace/server && \
    ln -sf /workspace/.output/server/index.mjs /workspace/server.mjs && \
    chmod +x start.js index.js

# Exponer el puerto
EXPOSE 8080

# Comando para iniciar el servidor (usando el script de diagnóstico directo)
CMD ["node", "diagnosis.mjs"] 