import { initializeApp, getApps, cert, getApp } from "firebase-admin/app";
import { getFirestore, Firestore } from "firebase-admin/firestore";
import path from "path";
import fs from "fs";

// Intentar inicializar Firebase Admin y exportar la instancia
let firebaseApp: any;
let firestoreDb: Firestore | null = null;
let isInitialized = false;
let initializationError: Error | null = null;

// Función para obtener singleton de Firestore
export function getFirestoreDb(): Firestore {
  if (firestoreDb) {
    return firestoreDb;
  }

  // Si hubo un error de inicialización previo, lanzarlo
  if (initializationError) {
    console.error(
      "[getFirestoreDb] Usando Firestore con error de inicialización previo:",
      initializationError
    );
    throw initializationError;
  }

  try {
    // Si ya existe una app, obtenemos su instancia
    if (getApps().length > 0) {
      const app = getApp();
      firestoreDb = getFirestore(app);
      isInitialized = true;
      return firestoreDb;
    }

    // De lo contrario, lanzamos un error ya que debería estar inicializado
    throw new Error(
      "Firebase Admin no está inicializado. getFirestoreDb() llamado antes de la inicialización."
    );
  } catch (error) {
    console.error("[getFirestoreDb] Error obteniendo Firestore:", error);
    initializationError =
      error instanceof Error ? error : new Error(String(error));
    throw error;
  }
}

// Variable para almacenar la función original en caso de necesitar reemplazarla
let originalGetFirestoreDb = getFirestoreDb;

/**
 * Plugin para inicializar Firebase Admin SDK en el servidor
 * Este plugin se ejecuta una vez al inicio del servidor
 */
export default defineNitroPlugin(async () => {
  console.log("[Server Plugin] Inicializando Firebase Admin...");

  try {
    // Si ya hay apps inicializadas, no hacemos nada
    if (getApps().length > 0) {
      console.log(
        "[Server Plugin] Firebase Admin ya estaba inicializado. Apps:",
        getApps().length
      );
      try {
        // Intentamos obtener la app existente
        firebaseApp = getApp();
        firestoreDb = getFirestore(firebaseApp);
        isInitialized = true;
        console.log("[Server Plugin] Reutilizando Firebase Admin existente");
      } catch (appError) {
        console.error(
          "[Server Plugin] Error al obtener app existente:",
          appError
        );
        initializationError =
          appError instanceof Error ? appError : new Error(String(appError));
      }
      return;
    }

    const config = useRuntimeConfig();

    // Verificar e imprimir el estado de las variables de configuración (sin exponer valores)
    console.log("[Server Plugin] Estado de configuración Firebase Admin:", {
      projectIdExists: !!config.firebase?.projectId,
      clientEmailExists: !!config.firebase?.clientEmail,
      privateKeyExists: !!config.firebase?.privateKey,
      privateKeyLength: config.firebase?.privateKey
        ? config.firebase.privateKey.length
        : 0,
    });

    // Intentar inicializar con variables de entorno
    if (
      config.firebase?.projectId &&
      config.firebase?.clientEmail &&
      config.firebase?.privateKey
    ) {
      console.log(
        "[Server Plugin] Inicializando Firebase Admin con variables de entorno"
      );

      try {
        firebaseApp = initializeApp({
          credential: cert({
            projectId: config.firebase.projectId,
            clientEmail: config.firebase.clientEmail,
            privateKey: config.firebase.privateKey.replace(/\\n/g, "\n"),
          }),
        });

        // Inicializar Firestore inmediatamente para verificar que funciona
        firestoreDb = getFirestore(firebaseApp);

        // Hacer una prueba de conexión simple para verificar que realmente funciona
        const testCollection = firestoreDb.collection("_test_connection");
        const testDoc = testCollection.doc("test");

        try {
          // Usar await dentro de un bloque try/catch para prueba
          await testDoc.set({ timestamp: new Date() });
          await testDoc.delete();
          console.log(
            "[Server Plugin] Prueba de escritura en Firestore exitosa"
          );
        } catch (testError) {
          console.error(
            "[Server Plugin] Error en prueba de escritura:",
            testError
          );
          throw testError;
        }

        isInitialized = true;
        console.log(
          "[Server Plugin] Firebase Admin inicializado con éxito, Firestore disponible y probado"
        );
      } catch (initError) {
        console.error(
          "[Server Plugin] Error inicializando Firebase Admin con vars de entorno:",
          initError
        );
        initializationError =
          initError instanceof Error ? initError : new Error(String(initError));
        throw initError;
      }
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

      console.log(
        "[Server Plugin] Buscando archivo de credenciales en:",
        serviceAccountPath
      );

      if (!fs.existsSync(serviceAccountPath)) {
        const error = new Error(
          `No se encontró el archivo de credenciales en: ${serviceAccountPath}`
        );
        initializationError = error;
        throw error;
      }

      try {
        // Leer y verificar el archivo para debugging
        const fileContent = fs.readFileSync(serviceAccountPath, "utf8");
        const jsonValid = !!JSON.parse(fileContent);
        console.log(
          "[Server Plugin] Archivo de credenciales es JSON válido:",
          jsonValid
        );

        firebaseApp = initializeApp({
          credential: cert(serviceAccountPath),
        });

        // Inicializar Firestore inmediatamente para verificar que funciona
        firestoreDb = getFirestore(firebaseApp);

        // Hacer una prueba de conexión simple para verificar que realmente funciona
        const testCollection = firestoreDb.collection("_test_connection");
        const testDoc = testCollection.doc("test");

        try {
          // Usar await dentro de un bloque try/catch para prueba
          await testDoc.set({ timestamp: new Date() });
          await testDoc.delete();
          console.log(
            "[Server Plugin] Prueba de escritura en Firestore exitosa"
          );
        } catch (testError) {
          console.error(
            "[Server Plugin] Error en prueba de escritura:",
            testError
          );
          throw testError;
        }

        isInitialized = true;
        console.log(
          "[Server Plugin] Firebase Admin inicializado con éxito mediante archivo JSON y probado"
        );
      } catch (jsonError) {
        console.error(
          "[Server Plugin] Error inicializando Firebase Admin con JSON:",
          jsonError
        );
        initializationError =
          jsonError instanceof Error ? jsonError : new Error(String(jsonError));
        throw jsonError;
      }
    }

    // Publicar para depuración los nombres de las apps disponibles
    console.log(
      "[Server Plugin] Apps de Firebase disponibles:",
      getApps().map((app) => app.name)
    );
  } catch (error) {
    console.error(
      "[Server Plugin] Error crítico inicializando Firebase Admin:",
      error
    );

    initializationError =
      error instanceof Error ? error : new Error(String(error));

    // En caso de error, creamos una nueva función que informará del error
    const errorDb = () => {
      throw new Error(
        `Firestore no está disponible. Error durante la inicialización de Firebase Admin: ${initializationError?.message}`
      );
    };

    // Reemplazamos la función exportada
    // @ts-ignore - Necesario para poder hacer el reemplazo
    getFirestoreDb = errorDb;
  }
});

// Exportar estado de inicialización para diagnóstico
export function getFirebaseAdminStatus() {
  return {
    isInitialized,
    hasFirestoreDb: !!firestoreDb,
    hasError: !!initializationError,
    errorMessage: initializationError?.message,
    appsCount: getApps().length,
  };
}
