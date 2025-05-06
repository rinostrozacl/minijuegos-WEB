// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  
  // Usar fecha de compatibilidad estándar
  compatibilityDate: "2023-03-01",

  modules: ["@nuxt/image", "@nuxt/ui", "@nuxtjs/tailwindcss"],

  ui: {
    global: true,
  },

  nitro: {
    compressPublicAssets: true,
    routeRules: {
      '/_nuxt/**': { headers: { 'cache-control': 'public, max-age=31536000, immutable' } },
      '/**/*.css': { headers: { 'content-type': 'text/css; charset=utf-8' } }
    }
  },

  vite: {
    css: {
      devSourcemap: true,
    },
  },

  experimental: {
    watcher: 'parcel'
  },

  css: ["~/assets/css/main.css"],

  // Configuración de variables de entorno
  runtimeConfig: {
    // Claves privadas (solo servidor)
    resendApiKey: process.env.RESEND_API_KEY || "",

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
