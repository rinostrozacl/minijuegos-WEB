import { initializeApp, type FirebaseOptions } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// Opcional: Importa Analytics si lo usas
// import { getAnalytics } from 'firebase/analytics'

// Plugin con mayor nivel de seguridad para la inicialización de Firebase
// Nombre: 1.firebase.client.ts para asegurar que se cargue antes
export default defineNuxtPlugin((nuxtApp) => {
  try {
    // Aseguramos los tipos para las variables de entorno públicas
    const config = useRuntimeConfig().public as {
      firebaseApiKey: string;
      firebaseAuthDomain: string;
      firebaseProjectId: string;
      firebaseStorageBucket: string;
      firebaseMessagingSenderId: string;
      firebaseAppId: string;
      firebaseMeasurementId?: string;
    };

    // Verificar si tenemos las configuraciones necesarias
    if (!config.firebaseApiKey || !config.firebaseProjectId) {
      console.error(
        "[Firebase Plugin] Error: Faltan variables de entorno para Firebase"
      );
      // Proporciona servicios nulos pero evita que la aplicación falle
      nuxtApp.provide("auth", null);
      nuxtApp.provide("firestore", null);
      nuxtApp.provide("storage", null);
      return;
    }

    console.log("[Firebase Plugin] Inicializando Firebase...");

    const firebaseConfig: FirebaseOptions = {
      apiKey: config.firebaseApiKey,
      authDomain: config.firebaseAuthDomain,
      projectId: config.firebaseProjectId,
      storageBucket: config.firebaseStorageBucket,
      messagingSenderId: config.firebaseMessagingSenderId,
      appId: config.firebaseAppId,
      measurementId: config.firebaseMeasurementId,
    };

    // Inicializar Firebase
    const app = initializeApp(firebaseConfig);

    // Inicializar servicios
    const auth = getAuth(app);
    const firestore = getFirestore(app);
    const storage = getStorage(app);

    // Confirmar que los servicios se han inicializado correctamente
    if (!auth) {
      console.error(
        "[Firebase Plugin] Error: El servicio de autenticación no se pudo inicializar"
      );
    }
    if (!firestore) {
      console.error(
        "[Firebase Plugin] Error: El servicio de Firestore no se pudo inicializar"
      );
    }
    if (!storage) {
      console.error(
        "[Firebase Plugin] Error: El servicio de Storage no se pudo inicializar"
      );
    }

    // Hacer servicios disponibles para la aplicación
    nuxtApp.provide("auth", auth);
    nuxtApp.provide("firestore", firestore);
    nuxtApp.provide("storage", storage);

    console.log("[Firebase Plugin] Firebase inicializado exitosamente");
    return {
      provide: {
        firebase: app,
      },
    };
  } catch (error) {
    console.error("[Firebase Plugin] Error al inicializar Firebase:", error);

    // Proporcionar servicios nulos en caso de error pero evitar que la aplicación falle
    nuxtApp.provide("auth", null);
    nuxtApp.provide("firestore", null);
    nuxtApp.provide("storage", null);
  }
});
