// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },

  // Usar fecha de compatibilidad estándar
  compatibilityDate: "2023-03-01",

  app: {
    head: {
      title: "GameCraft2025",
      meta: [
        {
          name: "description",
          content:
            "GameCraft2025 - Competencia universitaria de desarrollo de videojuegos",
        },
      ],
    },
  },

  modules: ["@nuxt/image", "@nuxt/ui", "@nuxt/icon"],

  // Configuración explícita de plugins para controlar orden de carga
  plugins: ["~/plugins/1.firebase.client.ts", "~/plugins/2.auth.client.ts"],

  // Configuración específica para Nuxt Icon (parte de @nuxt/ui)
  icon: {
    size: "24px",
    class: "icon",
    // Configurar para asegurar compatibilidad en producción
    mode: "all", // Habilitar todos los modos de renderizado
    aliases: {
      // Definir aliases comunes para mantener coherencia
      github: "simple-icons:github",
      twitter: "simple-icons:twitter",
      instagram: "simple-icons:instagram",
    },
  },

  nitro: {
    compressPublicAssets: true,
    preset: "node-server",
    routeRules: {
      "/_nuxt/**": {
        headers: { "cache-control": "public, max-age=31536000, immutable" },
      },
      "/**/*.css": { headers: { "content-type": "text/css; charset=utf-8" } },
    },
    // Incluir explícitamente los módulos de iconos en el bundle
    externals: {
      inline: ["@iconify-json/heroicons", "@iconify-json/simple-icons"],
    },
  },

  // Configuración explícita para el servidor en producción
  runtimeConfig: {
    // Variables para servidor
    nitro: {},

    // Claves privadas (solo servidor)
    resendApiKey: process.env.RESEND_API_KEY || "",

    // Firebase Admin SDK (solo servidor)
    firebase: {
      projectId: process.env.FIREBASE_PROJECT_ID || "",
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL || "",
      privateKey: process.env.FIREBASE_PRIVATE_KEY || "",
    },

    // Claves públicas (cliente + servidor) - Definirlas explícitamente para evitar problemas
    public: {
      firebaseApiKey:
        process.env.NUXT_PUBLIC_FIREBASE_API_KEY ||
        "AIzaSyAkbQHYgQ_LiKgM5ZFe9b6HwY0POCOxn9c",
      firebaseAuthDomain:
        process.env.NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN ||
        "minijuegos-1012b.firebaseapp.com",
      firebaseProjectId:
        process.env.NUXT_PUBLIC_FIREBASE_PROJECT_ID || "minijuegos-1012b",
      firebaseStorageBucket:
        process.env.NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
        "minijuegos-1012b.appspot.com",
      firebaseMessagingSenderId:
        process.env.NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "1075621373675",
      firebaseAppId:
        process.env.NUXT_PUBLIC_FIREBASE_APP_ID ||
        "1:1075621373675:web:33b4a9ebe8913edf387ec5",
      firebaseMeasurementId:
        process.env.NUXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-XXXXXXXXXX",
    },
  },

  vite: {
    css: {
      devSourcemap: true,
    },
    // Asegurar que los módulos de iconos se incluyan en el bundle
    optimizeDeps: {
      include: ["@iconify-json/heroicons", "@iconify-json/simple-icons"],
    },
  },

  experimental: {
    watcher: "parcel",
  },

  css: ["~/assets/css/main.css"],
});
