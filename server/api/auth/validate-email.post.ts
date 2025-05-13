import { isEmailAllowed } from "~/server/data/allowed-emails";

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

    // Verificar si el correo está en la lista de permitidos
    const isAllowed = isEmailAllowed(email);

    if (!isAllowed) {
      return {
        success: false,
        message:
          "Este correo no está autorizado para registrarse en la plataforma",
      };
    }

    // Si todo está bien, devolver éxito
    return {
      success: true,
      message: "Correo válido",
    };
  } catch (error) {
    console.error("Error al validar correo:", error);
    return {
      success: false,
      message: "Error interno del servidor",
    };
  }
});
