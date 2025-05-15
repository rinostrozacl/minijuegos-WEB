FROM node:20-alpine

WORKDIR /app

# Instalar dependencias necesarias
RUN apk add --no-cache bash git

# Copiar archivos de la aplicación
COPY . .

# Asegurar que el archivo de credenciales esté presente
RUN ls -la minijuegos-firebasekey.json || echo "ADVERTENCIA: Archivo de credenciales no encontrado"

# Instalar dependencias
RUN yarn install

# Compilar la aplicación
RUN yarn build

# Variables de entorno para el servidor
ENV NUXT_HOST=0.0.0.0
ENV NUXT_PORT=3000
ENV NODE_ENV=production

# Firebase Admin SDK
ENV FIREBASE_PROJECT_ID=minijuegos-1012b
ENV FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@minijuegos-1012b.iam.gserviceaccount.com
ENV FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCpemCTexEshBud\nlUPl3G/KuHgIkkg0M1jDSJw4BMpdeaNW2k25mEgCtWTZ3rI7Qs2kBSXYN4CQjVF1\nSRH2CATE9GP7AoGamcQ3sLHv8NPn5LWcZTzCtNaWtdLL4jxZtzyPrY441ENx0fRv\nbZzNUQQ42wlSE1nLrFshqEys2WeuXmvzGaic3stL4XsZbRVuMvTmRTQCqmkdO4fy\n9Kk89573uUrmZs38e9HbTgFFl0B7caVpJQibA8bhz99NI147aZ6aVvHot+/43dGt\nV4WV+hfPLZSjjmbJYdjMhQfN2F7J43rkOTuC5/0B4S9JrLdtwLFn9XFN8386ejdh\nEv9WPyDXAgMBAAECggEATlxVFxvJ/wk+M4h2kmtwDQ1qApyQYgJzwidqg8RDRSEe\n0uOxGGU+tnHkpZAAXMIwjuwKaYSQH0YYKeCVO2rNubs+Fys7fZ4nSZCbVVPGxuvK\nxPtSMrymk5ySUM7UFK9SgyQ+JCyQ2qm3GWZXH9+b0iYEkzx7Ql747AEDItCKzeX9\n48jtMhCLEaoPS5K8h6AvuwEYJbyioQTC7eBZMtIeHUTwh3YMcuSAoB//hE3gsx7u\npo2G5W0ee1UqKima01csjwleZM2EugZHMqlsBKOMv8cu+TkGUQmrKtI33nnQlid/\nCE2klnxd7oz5sM9It5QmJoSiglvfbIvL39GGPbzvcQKBgQDTcvnWJhXUgMn9q7p3\nryyxa83KapS/xZJ4fj2r5O4pyGB/5BMg5naBfEvf9Wb5dZGqYdPe1qUnjbgChI43\nsphbBcjuaa3jnlpndvP8azLhVnekgx1+7HNTR02ck7dCzGGKYs9uL6rI7ts1kqqt\n2kRdnFU3yHtNfaD0y+IvEVMumwKBgQDNL5adGKO244PBTh4lJvuocTeRRvDOldyh\nELF0krl6djxokPZ+BWdEeHurk0o9LkLG2zcp+oo3YH+PmwxdScsQVMmlf8iPpNDk\nat1FFx09CHeiTDQDrJuOwjfi2VTfGGOq7VfIY+huBZU4+jsvhL6ZFScz5z8rkSB+"

# Firebase Cliente (públicas)
ENV NUXT_PUBLIC_FIREBASE_API_KEY="AIzaSyAkbQHYgQ_LiKgM5ZFe9b6HwY0POCOxn9c"
ENV NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN="minijuegos-1012b.firebaseapp.com"
ENV NUXT_PUBLIC_FIREBASE_PROJECT_ID="minijuegos-1012b"
ENV NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET="minijuegos-1012b.appspot.com"
ENV NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="1075621373675"
ENV NUXT_PUBLIC_FIREBASE_APP_ID="1:1075621373675:web:33b4a9ebe8913edf387ec5"

# Exponer puerto
EXPOSE 3000

# Comando para iniciar la aplicación
CMD ["npm", "start"] 