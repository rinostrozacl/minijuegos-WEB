import { getFirestore } from "firebase-admin/firestore";
import { getFirestoreDb } from "../../plugins/firebase-admin";

/**
 * Endpoint para verificar si un correo electrónico está permitido para registrarse
 * Esta validación se realiza en el servidor para mantener la seguridad
 */
export default defineEventHandler(async (event) => {
  try {
    // Obtener el correo del cuerpo de la solicitud
    const body = await readBody(event);
    const { email } = body;

    // Verificar que se proporcionó un correo
    if (!email) {
      return {
        success: false,
        message: "Se requiere un correo electrónico",
      };
    }

    // Validar formato básico del correo (esta es solo una validación adicional)
    const emailRegex = /^[a-zA-Z0-9._-]+@(alumnos\.|)santotomas\.cl$/;
    if (!emailRegex.test(email)) {
      return {
        success: false,
        message:
          "El correo debe ser un correo institucional (@alumnos.santotomas.cl o @santotomas.cl)",
      };
    }

    // Verificar si el correo está en la lista de permitidos consultando directamente Firestore
    try {
      // Usar la función centralizada para obtener Firestore
      const db = getFirestoreDb();
      const emailLowerCase = email.toLowerCase().trim();

      // Primera estrategia: buscar por ID (convertido)
      const docId = emailLowerCase.replace(/[@.]/g, "_");
      const docRef = db.collection("allowed-emails").doc(docId);
      const doc = await docRef.get();

      let isAllowed = false;
      let userType = "student";

      if (doc.exists) {
        const data = doc.data();
        // Verificar si el correo está habilitado
        if (data && data.enabled === true) {
          isAllowed = true;
          userType = data.type || "student";
        }
      } else {
        // Segunda estrategia: buscar por campo email
        const querySnapshot = await db
          .collection("allowed-emails")
          .where("email", "==", emailLowerCase)
          .where("enabled", "==", true)
          .limit(1)
          .get();

        if (!querySnapshot.empty) {
          const data = querySnapshot.docs[0].data();
          isAllowed = true;
          userType = data.type || "student";
        }
      }

      if (!isAllowed) {
        return {
          success: false,
          message:
            "Este correo no está autorizado para registrarse en la plataforma",
          reason: "email_not_allowed",
        };
      }

      // Si todo está bien, devolver éxito
      return {
        success: true,
        message: "Correo válido",
        userType: userType,
      };
    } catch (error) {
      console.error("Error al verificar correo en Firestore:", error);
      return {
        success: false,
        message: "Error al validar el correo. Inténtalo de nuevo más tarde.",
      };
    }
  } catch (error) {
    console.error("Error al validar correo:", error);
    return {
      success: false,
      message: "Error interno del servidor",
    };
  }
});
