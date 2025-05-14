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

    // Verificar si el correo está en la lista de permitidos usando el nuevo endpoint
    try {
      const response = await $fetch<{
        success: boolean;
        isAllowed?: boolean;
        reason?: string;
        userType?: string;
        error?: string;
      }>("/api/verification/allowed-email", {
        method: "POST",
        body: {
          email,
        },
      });

      // Si hay un error en la respuesta
      if (!response.success) {
        return {
          success: false,
          message: "Error al verificar el correo electrónico",
        };
      }

      // Si el correo no está permitido
      if (!response.isAllowed) {
        return {
          success: false,
          message:
            "Este correo no está autorizado para registrarse en la plataforma",
          reason: response.reason || "email_not_allowed",
        };
      }

      // Si todo está bien, devolver éxito
      return {
        success: true,
        message: "Correo válido",
        userType: response.userType || "student",
      };
    } catch (error) {
      console.error("Error al llamar al servicio de validación:", error);
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
