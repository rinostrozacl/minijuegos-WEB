import { initializeApp, type FirebaseOptions } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// Opcional: Importa Analytics si lo usas
// import { getAnalytics } from 'firebase/analytics'

export default defineNuxtPlugin((nuxtApp) => {
  // Aseguramos los tipos para las variables de entorno públicas
  const config = useRuntimeConfig().public as {
    firebaseApiKey: string;
    firebaseAuthDomain: string;
    firebaseProjectId: string;
    firebaseStorageBucket: string;
    firebaseMessagingSenderId: string;
    firebaseAppId: string;
    firebaseMeasurementId?: string; // Opcional
  };

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

  // Inicializar servicios que necesites
  const auth = getAuth(app);
  const firestore = getFirestore(app);
  const storage = getStorage(app);
  // const analytics = getAnalytics(app) // Descomenta si usas Analytics

  // Hacer servicios disponibles globalmente en la app Nuxt
  // Ahora podrás usar $auth, $firestore, etc. en tus componentes y páginas
  nuxtApp.provide("auth", auth);
  nuxtApp.provide("firestore", firestore);
  nuxtApp.provide("storage", storage);
  // nuxtApp.provide('analytics', analytics) // Descomenta si usas Analytics

  console.log("Firebase plugin initialized!"); // Log para confirmar inicialización
});
