import { initializeApp, getApps, cert } from "firebase-admin/app";
import path from "path";
import fs from "fs";

/**
 * Plugin para inicializar Firebase Admin SDK en el servidor
 * Este plugin se ejecuta una vez al inicio del servidor
 */
export default defineNitroPlugin(() => {
  console.log("[Server Plugin] Inicializando Firebase Admin...");

  // Inicializar Firebase Admin si no está inicializado
  if (!getApps().length) {
    try {
      const config = useRuntimeConfig();

      // Intentar inicializar con variables de entorno
      if (
        config.firebase?.projectId &&
        config.firebase?.clientEmail &&
        config.firebase?.privateKey
      ) {
        console.log(
          "[Server Plugin] Inicializando Firebase Admin con variables de entorno"
        );
        initializeApp({
          credential: cert({
            projectId: config.firebase.projectId,
            clientEmail: config.firebase.clientEmail,
            privateKey: config.firebase.privateKey.replace(/\\n/g, "\n"),
          }),
        });
      }
      // Si no hay variables de entorno, intentar con el archivo JSON
      else {
        console.log(
          "[Server Plugin] Intentando inicializar Firebase Admin con archivo JSON"
        );
        const serviceAccountPath = path.resolve(
          process.cwd(),
          "minijuegos-firebasekey.json"
        );

        if (!fs.existsSync(serviceAccountPath)) {
          throw new Error(
            `No se encontró el archivo de credenciales en: ${serviceAccountPath}`
          );
        }

        initializeApp({
          credential: cert(serviceAccountPath),
        });
      }

      console.log("[Server Plugin] Firebase Admin inicializado con éxito");
    } catch (error) {
      console.error(
        "[Server Plugin] Error inicializando Firebase Admin:",
        error
      );
    }
  } else {
    console.log("[Server Plugin] Firebase Admin ya estaba inicializado");
  }
});
