// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },

  // Usar fecha de compatibilidad estándar
  compatibilityDate: "2023-03-01",

  app: {
    head: {
      title: "GameCraft2026",
      meta: [
        {
          name: "description",
          content:
            "GameCraft2026 - Torneo de desarrollo de videojuegos en Unity con temáticas mitológicas",
        },
      ],
    },
  },

  modules: [
    "@nuxtjs/tailwindcss",
    "@nuxt/ui",
    "@pinia/nuxt",
    "@nuxtjs/color-mode",
  ],

  // Configuración de Nuxt UI
  ui: {},

  // Configuración del modo de color
  colorMode: {
    preference: "dark",
    fallback: "dark",
    storageKey: "nuxt-color-mode",
  },

  // Configuración HTTPS para desarrollo
  devServer: {
    https: {
      key: "./certs/localhost-key.pem",
      cert: "./certs/localhost-cert.pem",
    },
    port: 3000,
  },

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
    // Configuración para manejar uploads grandes
    experimental: {
      wasm: true,
    },
    // Juegos: importación GitHub Pages (server/api/games/import-github-pages.post.ts)
    esbuild: {
      options: {
        target: "node16",
      },
    },
    routeRules: {
      "/_nuxt/**": {
        headers: { "cache-control": "public, max-age=31536000, immutable" },
      },
      "/**/*.css": { headers: { "content-type": "text/css; charset=utf-8" } },
      // Configuración específica para archivos Brotli de Unity WebGL
      "/**/*.br": {
        headers: {
          "content-encoding": "br",
          "content-type": "application/javascript",
        },
      },
      "/**/*.js.br": {
        headers: {
          "content-encoding": "br",
          "content-type": "application/javascript",
        },
      },
      "/**/*.wasm.br": {
        headers: {
          "content-encoding": "br",
          "content-type": "application/wasm",
        },
      },
      "/**/*.data.br": {
        headers: {
          "content-encoding": "br",
          "content-type": "application/octet-stream",
        },
      },
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
    // Remitente Resend (dominio verificado en https://resend.com/domains). Vacío = usar remitente de prueba de Resend.
    resendFromEmail: process.env.RESEND_FROM_EMAIL || "",

    // Firebase Admin: no bakear secretos en el build Docker (solo runtime / Coolify).
    firebase: {
      projectId: "",
      clientEmail: "",
      privateKey: "",
    },

    // Claves públicas (cliente + servidor).
    // Preferir NUXT_PUBLIC_* (Docker / .env.example); fallback sin prefijo por compatibilidad local.
    public: {
      appMode: process.env.NODE_ENV || "development",
      firebaseApiKey:
        process.env.NUXT_PUBLIC_FIREBASE_API_KEY ||
        process.env.FIREBASE_API_KEY ||
        "",
      firebaseAuthDomain:
        process.env.NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN ||
        process.env.FIREBASE_AUTH_DOMAIN ||
        "",
      firebaseProjectId:
        process.env.NUXT_PUBLIC_FIREBASE_PROJECT_ID ||
        process.env.FIREBASE_PROJECT_ID ||
        "",
      firebaseStorageBucket:
        process.env.NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
        process.env.FIREBASE_STORAGE_BUCKET ||
        "",
      firebaseMessagingSenderId:
        process.env.NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ||
        process.env.FIREBASE_MESSAGING_SENDER_ID ||
        "",
      firebaseAppId:
        process.env.NUXT_PUBLIC_FIREBASE_APP_ID ||
        process.env.FIREBASE_APP_ID ||
        "",
      firebaseMeasurementId:
        process.env.NUXT_PUBLIC_FIREBASE_MEASUREMENT_ID ||
        process.env.FIREBASE_MEASUREMENT_ID ||
        "",
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
