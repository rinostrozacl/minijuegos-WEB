// Plugin para inicializar Firebase Admin en el servidor
import { defineNitroPlugin } from "nitropack/runtime";
import admin from "firebase-admin";

export default defineNitroPlugin((nitroApp) => {
  // Depuración de variables
  console.log("======= DEBUG PLUGIN (SERVER) =======");
  console.log("NODE_ENV:", process.env.NODE_ENV || "no definido");
  console.log("\nVariables Firebase disponibles:");
  console.log("FIREBASE_PROJECT_ID:", !!process.env.FIREBASE_PROJECT_ID);
  console.log("FIREBASE_CLIENT_EMAIL:", !!process.env.FIREBASE_CLIENT_EMAIL);
  console.log(
    "FIREBASE_PRIVATE_KEY existencia:",
    !!process.env.FIREBASE_PRIVATE_KEY
  );

  // Verificar variables públicas de Firebase
  console.log("\nVariables Firebase públicas:");
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
  console.log("====================================\n");

  // Inicializar Firebase Admin si no está ya inicializado
  if (!admin.apps.length && process.env.FIREBASE_PROJECT_ID) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        }),
        databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`,
      });
      console.log("✅ Firebase Admin SDK inicializado correctamente");
    } catch (error) {
      console.error("❌ Error al inicializar Firebase Admin SDK:", error);
    }
  }
});
