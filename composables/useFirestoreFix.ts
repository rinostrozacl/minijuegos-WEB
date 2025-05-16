import {
  getFirestore,
  enableIndexedDbPersistence,
  disableNetwork,
  enableNetwork,
  type Firestore,
} from "firebase/firestore";
import { getApp } from "firebase/app";

export const useFirestoreFix = () => {
  const { $firestore } = useNuxtApp();
  const firestore = $firestore as Firestore | null;
  const isFixing = ref(false);
  const fixStatus = ref("");

  // Verificar problemas comunes y solucionarlos
  const checkAndFixFirestore = async () => {
    isFixing.value = true;
    fixStatus.value = "Iniciando diagnóstico de Firestore...";

    try {
      // Verificar si tenemos la instancia de Firestore
      if (!firestore) {
        fixStatus.value =
          "Error: La instancia de Firestore no está disponible.";
        console.error(
          "[FirestoreFix] La instancia de Firestore no está disponible en el cliente"
        );

        // Intentar recuperar o reinicializar Firestore
        try {
          fixStatus.value = "Intentando recuperar instancia de Firestore...";
          const app = getApp();
          const newFirestore = getFirestore(app);

          if (newFirestore) {
            fixStatus.value =
              "Instancia de Firestore recuperada correctamente.";
            console.log(
              "[FirestoreFix] Instancia de Firestore recuperada correctamente"
            );
            // Podríamos asignar esta instancia a una variable global o al estado para usarla
          } else {
            fixStatus.value = "No se pudo recuperar la instancia de Firestore.";
          }
        } catch (error: any) {
          console.error("[FirestoreFix] Error al recuperar instancia:", error);
          fixStatus.value = `Error al recuperar: ${error.message}`;
        }

        return { success: false, message: "No se pudo recuperar Firestore" };
      }

      // Si tenemos Firestore, intentar solucionar problemas de conectividad
      fixStatus.value = "Realizando reset de conexión a Firestore...";

      // Desactivar y reactivar la red puede ayudar con problemas de conectividad
      await disableNetwork(firestore);
      console.log("[FirestoreFix] Red desactivada temporalmente");
      fixStatus.value = "Red desactivada temporalmente...";

      // Esperar un momento
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Reactivar la red
      await enableNetwork(firestore);
      console.log("[FirestoreFix] Red reactivada");
      fixStatus.value = "Red reactivada correctamente.";

      // Intentar habilitar persistencia si no está ya habilitada
      try {
        fixStatus.value = "Intentando habilitar persistencia offline...";
        await enableIndexedDbPersistence(firestore);
        fixStatus.value = "Persistencia offline habilitada correctamente.";
        console.log(
          "[FirestoreFix] Persistencia offline habilitada correctamente"
        );
      } catch (persistenceError: any) {
        // Si el error es porque ya está habilitada, no es problema
        if (persistenceError.code === "failed-precondition") {
          fixStatus.value =
            "La persistencia ya está habilitada en otra pestaña.";
          console.log(
            "[FirestoreFix] La persistencia ya está habilitada en otra pestaña"
          );
        } else if (persistenceError.code === "unimplemented") {
          fixStatus.value =
            "El navegador no soporta IndexedDB para persistencia.";
          console.log(
            "[FirestoreFix] El navegador no soporta IndexedDB para persistencia"
          );
        } else {
          fixStatus.value = `Error al habilitar persistencia: ${persistenceError.message}`;
          console.error(
            "[FirestoreFix] Error al habilitar persistencia:",
            persistenceError
          );
        }
      }

      fixStatus.value = "Diagnóstico y reparación completados.";
      return { success: true, message: "Firestore reparado correctamente" };
    } catch (error: any) {
      console.error("[FirestoreFix] Error en la reparación:", error);
      fixStatus.value = `Error en la reparación: ${error.message}`;
      return { success: false, message: error.message || "Error desconocido" };
    } finally {
      isFixing.value = false;
    }
  };

  return {
    checkAndFixFirestore,
    isFixing,
    fixStatus,
  };
};
