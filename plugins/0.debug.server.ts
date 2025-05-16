// Plugin para depuración de variables de entorno
export default defineNuxtPlugin({
  name: "debug-env-plugin",
  enforce: "pre", // Asegurar que se ejecute antes que otros plugins
  setup() {
    console.log("======= DEBUG PLUGIN (SERVER) =======");
    console.log("NODE_ENV:", process.env.NODE_ENV);

    // Verificar variables de Firebase
    console.log("Variables Firebase disponibles:");
    console.log("FIREBASE_PROJECT_ID:", !!process.env.FIREBASE_PROJECT_ID);
    console.log("FIREBASE_CLIENT_EMAIL:", !!process.env.FIREBASE_CLIENT_EMAIL);
    console.log(
      "FIREBASE_PRIVATE_KEY existencia:",
      !!process.env.FIREBASE_PRIVATE_KEY
    );

    // Verificar variables públicas
    console.log("Variables Firebase públicas:");
    console.log(
      "NUXT_PUBLIC_FIREBASE_API_KEY:",
      !!process.env.NUXT_PUBLIC_FIREBASE_API_KEY
    );
    console.log(
      "NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN:",
      !!process.env.NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN
    );
    console.log(
      "NUXT_PUBLIC_FIREBASE_PROJECT_ID:",
      !!process.env.NUXT_PUBLIC_FIREBASE_PROJECT_ID
    );
    console.log(
      "NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET:",
      !!process.env.NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET
    );
    console.log(
      "NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID:",
      !!process.env.NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
    );
    console.log(
      "NUXT_PUBLIC_FIREBASE_APP_ID:",
      !!process.env.NUXT_PUBLIC_FIREBASE_APP_ID
    );
    console.log("====================================");
  },
});
