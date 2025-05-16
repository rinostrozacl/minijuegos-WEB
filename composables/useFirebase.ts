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

  // Verificar si Firestore está disponible al iniciar el composable
  if (!firestore) {
    console.warn("[useFirebase] Firestore no está disponible en el cliente");
  } else {
    console.log("[useFirebase] Firestore disponible en el cliente");
  }

  /**
   * Verifica si un correo electrónico está permitido consultando directamente a Firestore
   * @param email Correo electrónico a validar
   * @returns Resultado de la validación
   */
  const isEmailAllowed = async (email: string) => {
    try {
      // Verificar si firestore está disponible
      if (!firestore) {
        console.error(
          "[useFirebase] Firestore no está disponible para validar email"
        );
        // Fallback: verificar con el servidor si Firestore del cliente no está disponible
        try {
          console.log(
            "[useFirebase] Intentando validar email mediante API del servidor"
          );
          const response = await $fetch("/api/verification/allowed-email", {
            method: "POST",
            body: { email },
          });

          return response;
        } catch (serverError) {
          console.error(
            "[useFirebase] Error al validar email con API:",
            serverError
          );
          return {
            success: false,
            message: "Error al validar el correo. Servicio no disponible.",
          };
        }
      }

      const emailLowerCase = email.toLowerCase().trim();
      console.log("[useFirebase] Validando correo:", emailLowerCase);

      // Primera estrategia: buscar por ID (convertido)
      const docId = emailLowerCase.replace(/[@.]/g, "_");
      const docRef = doc(firestore, "allowed-emails", docId);

      try {
        const docSnap = await getDoc(docRef);
        console.log(
          "[useFirebase] Resultado de búsqueda por ID:",
          docSnap.exists() ? "Encontrado" : "No encontrado"
        );

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
      } catch (docError) {
        console.error(
          "[useFirebase] Error al obtener documento por ID:",
          docError
        );
        // Continuar con la siguiente estrategia
      }

      // Segunda estrategia: buscar por campo email
      try {
        const q = query(
          collection(firestore, "allowed-emails"),
          where("email", "==", emailLowerCase),
          where("enabled", "==", true)
        );

        const querySnapshot = await getDocs(q);
        console.log(
          "[useFirebase] Resultado de búsqueda por query:",
          !querySnapshot.empty ? "Encontrado" : "No encontrado"
        );

        if (!querySnapshot.empty) {
          const data = querySnapshot.docs[0].data();
          return {
            success: true,
            isAllowed: true,
            message: "Correo válido",
            userType: data.type || "student",
          };
        }
      } catch (queryError) {
        console.error(
          "[useFirebase] Error en consulta por campo email:",
          queryError
        );
        // Fallar con el mensaje adecuado
        return {
          success: false,
          message:
            "Error al verificar el correo. Problema en la consulta a Firestore.",
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
      console.error(
        "[useFirebase] Error al verificar correo permitido:",
        error
      );
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
