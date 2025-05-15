import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

/**
 * Endpoint para el registro de usuarios
 * Realiza la validación del correo directamente en Firestore y crea el usuario en Firebase si está permitido
 */
export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { email, password, displayName } = body;

    // Validar campos requeridos
    if (!email || !password || !displayName) {
      return {
        success: false,
        message: "Se requieren todos los campos: email, password y displayName",
      };
    }

    // Validar formato de correo
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
      const db = getFirestore();
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
    } catch (firestoreError) {
      console.error("Error al verificar correo en Firestore:", firestoreError);
      return {
        success: false,
        message: "Error al verificar el correo. Inténtalo de nuevo más tarde.",
      };
    }

    // Crear usuario en Firebase Auth
    const auth = getAuth();
    try {
      const userRecord = await auth.createUser({
        email,
        password,
        displayName,
        emailVerified: false,
      });

      // Enviar email de verificación (implementar con un servicio como Resend)
      // Este paso puede requerir una implementación específica según la solución que estés usando

      return {
        success: true,
        message: "Usuario registrado exitosamente",
        user: {
          uid: userRecord.uid,
          email: userRecord.email,
          displayName: userRecord.displayName,
        },
      };
    } catch (error: any) {
      console.error("Error al crear usuario en Firebase:", error);

      // Manejar errores específicos de Firebase
      if (error.code === "auth/email-already-exists") {
        return {
          success: false,
          message: "Este correo electrónico ya está registrado",
        };
      }

      return {
        success: false,
        message: "Error al crear usuario. Inténtalo de nuevo más tarde.",
      };
    }
  } catch (error) {
    console.error("Error en el registro:", error);
    return {
      success: false,
      message: "Error del servidor al procesar la solicitud",
    };
  }
});
