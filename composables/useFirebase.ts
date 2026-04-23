import {
  collection,
  getDocs,
  doc,
  getDoc,
  query,
  where,
} from "firebase/firestore";
import type { Firestore } from "firebase/firestore";

function isPermissionDenied(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code: string }).code === "permission-denied"
  );
}

async function validateAllowedEmailViaServerApi(email: string) {
  const response = await $fetch("/api/verification/allowed-email", {
    method: "POST",
    body: { email },
  });
  return response;
}

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
        // Suele ocurrir si faltan NUXT_PUBLIC_FIREBASE_* en runtime; el servidor sí puede validar.
        console.warn(
          "[useFirebase] Firestore cliente no disponible; validando correo vía API del servidor"
        );
        // Fallback: verificar con el servidor si Firestore del cliente no está disponible
        try {
          console.log("[useFirebase] POST /api/verification/allowed-email");
          return await validateAllowedEmailViaServerApi(email);
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
        if (isPermissionDenied(docError)) {
          console.warn(
            "[useFirebase] Firestore denegó lectura de allowed-emails; usando API del servidor"
          );
          try {
            return await validateAllowedEmailViaServerApi(email);
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
        if (isPermissionDenied(queryError)) {
          console.warn(
            "[useFirebase] Firestore denegó consulta allowed-emails; usando API del servidor"
          );
          try {
            return await validateAllowedEmailViaServerApi(email);
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
        console.error(
          "[useFirebase] Error en consulta por campo email:",
          queryError
        );
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
