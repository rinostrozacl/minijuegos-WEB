import { isEmailAllowed } from "~/server/data/allowed-emails";
import { getAuth } from "firebase-admin/auth";

/**
 * Endpoint para el registro de usuarios
 * Realiza la validación del correo y crea el usuario en Firebase si está permitido
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

    // Verificar si el correo está en la lista de permitidos
    const isAllowed = isEmailAllowed(email);
    if (!isAllowed) {
      return {
        success: false,
        message:
          "Este correo no está autorizado para registrarse en la plataforma",
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
