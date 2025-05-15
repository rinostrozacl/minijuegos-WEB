import { getFirestoreDb } from "../../plugins/firebase-admin";

// Definir tipos para la respuesta
interface AllowedEmailSuccessResponse {
  success: true;
  isAllowed: boolean;
  userType?: string;
  reason?: string;
}

interface AllowedEmailErrorResponse {
  success: false;
  error: string;
  details?: string;
}

type AllowedEmailResponse =
  | AllowedEmailSuccessResponse
  | AllowedEmailErrorResponse;

/**
 * Endpoint para verificar si un correo electrónico está en la lista de permitidos.
 * Este endpoint consulta directamente a Firestore en lugar de usar el archivo estático.
 *
 * @route POST /api/verification/allowed-email
 * @param {Object} event - Evento HTTP con el correo a verificar
 * @returns {AllowedEmailResponse} Resultado de la verificación
 */
export default defineEventHandler(
  async (event): Promise<AllowedEmailResponse> => {
    try {
      // Extraer el correo electrónico del cuerpo de la solicitud
      const body = await readBody(event);

      if (!body?.email) {
        return {
          success: false,
          error: "Se requiere un correo electrónico",
        };
      }

      const email = body.email.toLowerCase().trim();

      // Usar la función centralizada para obtener Firestore
      const db = getFirestoreDb();

      // Buscar el correo en la colección de correos permitidos
      const allowedEmailsCollection = db.collection("allowed-emails");

      // Primera estrategia: buscar por ID (convertido)
      const docId = email.replace(/[@.]/g, "_");
      const docRef = allowedEmailsCollection.doc(docId);
      const doc = await docRef.get();

      if (doc.exists) {
        const data = doc.data();

        // Verificar si el correo está habilitado
        if (data && data.enabled === true) {
          return {
            success: true,
            isAllowed: true,
            userType: data.type || "student",
          };
        } else if (data) {
          // El correo existe pero está deshabilitado
          return {
            success: true,
            isAllowed: false,
            reason: "email_disabled",
          };
        }
      }

      // Segunda estrategia: buscar por campo email
      const querySnapshot = await allowedEmailsCollection
        .where("email", "==", email)
        .where("enabled", "==", true)
        .limit(1)
        .get();

      if (!querySnapshot.empty) {
        const data = querySnapshot.docs[0].data();
        return {
          success: true,
          isAllowed: true,
          userType: data.type || "student",
        };
      }

      // Si llegamos aquí, el correo no está en la lista de permitidos
      return {
        success: true,
        isAllowed: false,
        reason: "email_not_in_list",
      };
    } catch (error: any) {
      console.error("[API] Error verificando correo permitido:", error);

      return {
        success: false,
        error: "Error al verificar el correo electrónico",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      };
    }
  }
);
