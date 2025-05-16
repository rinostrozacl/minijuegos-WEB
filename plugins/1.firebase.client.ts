import { initializeApp, type FirebaseOptions } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// Nombre: 1.firebase.client.ts para asegurar que se cargue antes

export default defineNuxtPlugin((nuxtApp) => {
  // Depuracion publica (sin revelar claves secretas)
  console.log("======= FIREBASE CLIENTE CONFIG =======");
  console.log("Entorno:", process.env.NODE_ENV || "no definido");

  try {
    // Aseguramos los tipos para las variables de entorno pu00fablicas
    const config = useRuntimeConfig().public as {
      firebaseApiKey: string;
      firebaseAuthDomain: string;
      firebaseProjectId: string;
      firebaseStorageBucket: string;
      firebaseMessagingSenderId: string;
      firebaseAppId: string;
      firebaseMeasurementId?: string;
    };

    // Log para debugging - DETALLADO para diagnosticar problemas
    console.log(
      "[Firebase Plugin] Comprobando configuración Firebase detallada:",
      {
        apiKeyExists: !!config.firebaseApiKey,
        apiKeyLength: config.firebaseApiKey?.length || 0,
        apiKeyPrefix: config.firebaseApiKey
          ? config.firebaseApiKey.substring(0, 5)
          : "",
        authDomainExists: !!config.firebaseAuthDomain,
        authDomain: config.firebaseAuthDomain, // Este valor es seguro mostrar
        projectIdExists: !!config.firebaseProjectId,
        projectId: config.firebaseProjectId, // Este valor es seguro para mostrar
        storageBucketExists: !!config.firebaseStorageBucket,
        storageBucket: config.firebaseStorageBucket, // Este valor es seguro para mostrar
        messagingSenderIdExists: !!config.firebaseMessagingSenderId,
        appIdExists: !!config.firebaseAppId,
        appIdPrefix: config.firebaseAppId?.substring(0, 8) || "", // Mostrar solo el principio
      }
    );

    // Verificar si tenemos las configuraciones necesarias
    if (!config.firebaseApiKey || !config.firebaseProjectId) {
      console.error(
        "[Firebase Plugin] ERROR CRÍTICO: Faltan variables de entorno para Firebase",
        !config.firebaseApiKey ? "- API_KEY faltante" : "",
        !config.firebaseProjectId ? "- PROJECT_ID faltante" : ""
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
    console.log("[Firebase Plugin] Configuración que se usará:", {
      ...firebaseConfig,
      apiKey: firebaseConfig.apiKey?.substring(0, 5) + "...", // Mostrar solo parte de la clave
    });

    // Inicializar Firebase
    console.log("[Firebase Plugin] Llamando a initializeApp...");
    const app = initializeApp(firebaseConfig);
    console.log("[Firebase Plugin] Firebase app inicializada correctamente");

    // Inicializar servicios
    console.log("[Firebase Plugin] Inicializando servicio de autenticación...");
    const auth = getAuth(app);
    console.log("[Firebase Plugin] Servicio de autenticación inicializado: OK");

    console.log("[Firebase Plugin] Inicializando servicio de Firestore...");
    const firestore = getFirestore(app);
    console.log("[Firebase Plugin] Servicio de Firestore inicializado: OK");

    console.log("[Firebase Plugin] Inicializando servicio de Storage...");
    const storage = getStorage(app);
    console.log("[Firebase Plugin] Servicio de Storage inicializado: OK");

    // Hacer servicios disponibles para la aplicación
    nuxtApp.provide("auth", auth);
    nuxtApp.provide("firestore", firestore);
    nuxtApp.provide("storage", storage);

    console.log("[Firebase Plugin] Firebase inicializado exitosamente ✅");
    console.log("======= FIREBASE CLIENTE INICIALIZADO =======");

    return {
      provide: {
        firebase: app,
      },
    };
  } catch (error) {
    console.error(
      "[Firebase Plugin] Error CRÍTICO al inicializar Firebase:",
      error
    );

    // Proporcionar servicios nulos en caso de error pero evitar que la aplicación falle
    nuxtApp.provide("auth", null);
    nuxtApp.provide("firestore", null);
    nuxtApp.provide("storage", null);
  }
});
