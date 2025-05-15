FROM node:20-alpine

WORKDIR /app

# Instalar dependencias necesarias
RUN apk add --no-cache bash git

# Copiar archivos de la aplicación
COPY . .

# Instalar dependencias
RUN yarn install

# Compilar la aplicación
RUN yarn build

ENV NUXT_HOST=0.0.0.0
# set app port
ENV NUXT_PORT=3000
# Exponer puerto
EXPOSE 3000

# Comando para iniciar la aplicación
CMD ["node", ".output/server/index.mjs"] 