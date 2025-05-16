import { initializeApp, type FirebaseOptions } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
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

    // Log para debugging - Imprimir valores sin exponer completamente las claves
    console.log("[Firebase Plugin] Comprobando configuración Firebase:", {
      apiKeyExists: !!config.firebaseApiKey,
      apiKeyLength: config.firebaseApiKey?.length || 0,
      authDomainExists: !!config.firebaseAuthDomain,
      projectIdExists: !!config.firebaseProjectId,
      projectId: config.firebaseProjectId, // Este valor es seguro para mostrar
      storageBucketExists: !!config.firebaseStorageBucket,
      messagingSenderIdExists: !!config.firebaseMessagingSenderId,
      appIdExists: !!config.firebaseAppId,
      appIdPrefix: config.firebaseAppId?.substring(0, 8) || "", // Mostrar solo el principio
    });

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

    // Mostrar la configuración que se usará (sin la apiKey completa)
    console.log("[Firebase Plugin] Configuración:", {
      ...firebaseConfig,
      apiKey: firebaseConfig.apiKey?.substring(0, 8) + "...", // Mostrar solo parte de la clave
    });

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
    } else {
      console.log("[Firebase Plugin] Servicio de autenticación inicializado");
    }

    if (!firestore) {
      console.error(
        "[Firebase Plugin] Error: El servicio de Firestore no se pudo inicializar"
      );
    } else {
      console.log("[Firebase Plugin] Servicio de Firestore inicializado");
    }

    if (!storage) {
      console.error(
        "[Firebase Plugin] Error: El servicio de Storage no se pudo inicializar"
      );
    } else {
      console.log("[Firebase Plugin] Servicio de Storage inicializado");
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
