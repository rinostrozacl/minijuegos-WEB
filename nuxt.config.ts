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

  modules: ["@nuxt/image", "@nuxt/ui"],

  // Configuración explícita de plugins para controlar orden de carga
  plugins: ["~/plugins/1.firebase.client.ts", "~/plugins/2.auth.client.ts"],

  nitro: {
    compressPublicAssets: true,
    routeRules: {
      "/_nuxt/**": {
        headers: { "cache-control": "public, max-age=31536000, immutable" },
      },
      "/**/*.css": { headers: { "content-type": "text/css; charset=utf-8" } },
    },
  },

  vite: {
    css: {
      devSourcemap: true,
    },
  },

  experimental: {
    watcher: "parcel",
  },

  css: ["~/assets/css/main.css"],

  // Configuración de variables de entorno
  runtimeConfig: {
    // Claves privadas (solo servidor)
    resendApiKey: process.env.RESEND_API_KEY || "",

    // Firebase Admin SDK (solo servidor)
    firebase: {
      projectId: process.env.FIREBASE_PROJECT_ID || "",
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL || "",
      privateKey: process.env.FIREBASE_PRIVATE_KEY || "",
    },

    // Claves públicas (cliente + servidor)
    public: {
      firebaseApiKey: process.env.NUXT_PUBLIC_FIREBASE_API_KEY || "",
      firebaseAuthDomain: process.env.NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
      firebaseProjectId: process.env.NUXT_PUBLIC_FIREBASE_PROJECT_ID || "",
      firebaseStorageBucket:
        process.env.NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
      firebaseMessagingSenderId:
        process.env.NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
      firebaseAppId: process.env.NUXT_PUBLIC_FIREBASE_APP_ID || "",
      firebaseMeasurementId:
        process.env.NUXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "",
    },
  },
});
