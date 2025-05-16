FROM node:20-alpine

WORKDIR /app

# Instalar dependencias necesarias
RUN apk add --no-cache bash git curl iputils

# Copiar archivos de la aplicación
COPY . .

# Asegurar que el archivo de credenciales esté presente
RUN ls -la minijuegos-firebasekey.json || echo "ADVERTENCIA: Archivo de credenciales no encontrado"

# Instalar dependencias
RUN yarn install

# Variables de entorno públicas para la compilación
ENV NUXT_PUBLIC_FIREBASE_API_KEY="AIzaSyAkbQHYgQ_LiKgM5ZFe9b6HwY0POCOxn9c"
ENV NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN="minijuegos-1012b.firebaseapp.com"
ENV NUXT_PUBLIC_FIREBASE_PROJECT_ID="minijuegos-1012b"
ENV NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET="minijuegos-1012b.appspot.com"
ENV NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="1075621373675"
ENV NUXT_PUBLIC_FIREBASE_APP_ID="1:1075621373675:web:33b4a9ebe8913edf387ec5"
ENV NUXT_PUBLIC_FIREBASE_MEASUREMENT_ID="G-XXXXXXXXXX"

# Compilar la aplicación
RUN yarn build

# Variables de entorno para el servidor
ENV NUXT_HOST=0.0.0.0
ENV NUXT_PORT=3000
ENV NODE_ENV=production

# Resend API Key
ENV RESEND_API_KEY="re_Ka1aZdkV_5knNdLCvQCXiptfUcqxyZTJ9"

# Firebase Admin SDK
ENV FIREBASE_PROJECT_ID=minijuegos-1012b
ENV FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@minijuegos-1012b.iam.gserviceaccount.com
ENV FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCpemCTexEshBud\nlUPl3G/KuHgIkkg0M1jDSJw4BMpdeaNW2k25mEgCtWTZ3rI7Qs2kBSXYN4CQjVF1\nSRH2CATE9GP7AoGamcQ3sLHv8NPn5LWcZTzCtNaWtdLL4jxZtzyPrY441ENx0fRv\nbZzNUQQ42wlSE1nLrFshqEys2WeuXmvzGaic3stL4XsZbRVuMvTmRTQCqmkdO4fy\n9Kk89573uUrmZs38e9HbTgFFl0B7caVpJQibA8bhz99NI147aZ6aVvHot+/43dGt\nV4WV+hfPLZSjjmbJYdjMhQfN2F7J43rkOTuC5/0B4S9JrLdtwLFn9XFN8386ejdh\nEv9WPyDX"

# Exponer puerto
EXPOSE 3000

# Verificar conectividad a servicios externos durante la construcción
RUN echo "Verificando conectividad a api.resend.com..." && \
    ping -c 2 api.resend.com || echo "No se pudo contactar a api.resend.com, pero continuaremos con la construcción"

# Comando para iniciar la aplicación
CMD ["npm", "start"] 