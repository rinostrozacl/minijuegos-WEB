import {
  collection,
  getDocs,
  doc,
  getDoc,
  query,
  where,
} from "firebase/firestore";
import type { Firestore } from "firebase/firestore";

/**
 * Composable para interactuar con Firebase directamente desde el cliente
 */
export const useFirebase = () => {
  const nuxtApp = useNuxtApp();
  const firestore = nuxtApp.$firestore as Firestore | null;

  /**
   * Verifica si un correo electrónico está permitido consultando directamente a Firestore
   * @param email Correo electrónico a validar
   * @returns Resultado de la validación
   */
  const isEmailAllowed = async (email: string) => {
    try {
      // Verificar si firestore está disponible
      if (!firestore) {
        console.error("Firestore no está disponible");
        return {
          success: false,
          message: "Error al validar el correo. Servicio no disponible.",
        };
      }

      const emailLowerCase = email.toLowerCase().trim();

      // Primera estrategia: buscar por ID (convertido)
      const docId = emailLowerCase.replace(/[@.]/g, "_");
      const docRef = doc(firestore, "allowed-emails", docId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();

        // Verificar si el correo está habilitado
        if (data && data.enabled === true) {
          return {
            success: true,
            isAllowed: true,
            message: "Correo válido",
            userType: data.type || "student",
          };
        } else if (data) {
          // El correo existe pero está deshabilitado
          return {
            success: true,
            isAllowed: false,
            message: "Este correo está deshabilitado para el registro",
            reason: "email_disabled",
          };
        }
      }

      // Segunda estrategia: buscar por campo email
      const q = query(
        collection(firestore, "allowed-emails"),
        where("email", "==", emailLowerCase),
        where("enabled", "==", true)
      );

      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const data = querySnapshot.docs[0].data();
        return {
          success: true,
          isAllowed: true,
          message: "Correo válido",
          userType: data.type || "student",
        };
      }

      // Si llegamos aquí, el correo no está en la lista de permitidos
      return {
        success: true,
        isAllowed: false,
        message:
          "Este correo no está autorizado para registrarse en la plataforma",
        reason: "email_not_in_list",
      };
    } catch (error) {
      console.error("Error al verificar correo permitido:", error);
      return {
        success: false,
        message: "Error al validar el correo. Inténtalo de nuevo más tarde.",
      };
    }
  };

  return {
    isEmailAllowed,
  };
};
