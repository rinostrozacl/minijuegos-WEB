// Plugin para inicializar Firebase Admin en el servidor
import { defineNitroPlugin } from "nitropack/runtime";
import admin from "firebase-admin";
import * as fs from "fs";
import * as path from "path";

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
  if (!admin.apps.length) {
    try {
      // Intentar usar el archivo de credenciales primero
      const keyFilePath = path.resolve(
        process.cwd(),
        "minijuegos-firebasekey.json"
      );

      if (fs.existsSync(keyFilePath)) {
        admin.initializeApp({
          credential: admin.credential.cert(keyFilePath),
        });
        console.log(
          "✅ Firebase Admin SDK inicializado correctamente desde archivo de credenciales"
        );
      }
      // Si no hay archivo, usar las variables de entorno
      else if (
        process.env.FIREBASE_PROJECT_ID &&
        process.env.FIREBASE_CLIENT_EMAIL &&
        process.env.FIREBASE_PRIVATE_KEY
      ) {
        const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(
          /\\n/g,
          "\n"
        );
        console.log("Longitud de la clave privada:", privateKey.length);

        admin.initializeApp({
          credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: privateKey,
          }),
        });
        console.log(
          "✅ Firebase Admin SDK inicializado correctamente desde variables de entorno"
        );
      } else {
        console.error(
          "❌ No se encontraron credenciales de Firebase Admin disponibles"
        );
      }
    } catch (error) {
      console.error("❌ Error al inicializar Firebase Admin SDK:", error);
    }
  } else {
    console.log("⚠️ Firebase Admin SDK ya estaba inicializado");
  }
});
