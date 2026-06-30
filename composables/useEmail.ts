/**
 * Composable para verificación de correo (OTP de registro).
 * El envío de emails solo ocurre en el servidor; no hay relay público.
 */
export const useEmail = () => {
  /**
   * Solicita un código de verificación a través del servidor
   */
  const requestVerificationCode = async (email: string) => {
    try {
      const { data, error } = await useFetch("/api/verification/generate", {
        method: "POST",
        body: { email },
      });

      if (error.value) {
        console.error(
          "Error al solicitar código de verificación:",
          error.value
        );
        return {
          success: false,
          error: error.value,
          message: "Error de red al solicitar el código",
        };
      }

      const payload = data.value as {
        success?: boolean;
        message?: string;
      } | null;

      if (!payload?.success) {
        return {
          success: false,
          error: payload,
          message:
            payload?.message ||
            "No se pudo enviar el código de verificación",
        };
      }

      return { success: true, data: payload };
    } catch (err) {
      console.error("Error inesperado al solicitar verificación:", err);
      return {
        success: false,
        error: err,
        message: "Error inesperado al solicitar verificación",
      };
    }
  };

  /**
   * Verifica un código ingresado por el usuario
   */
  const verifyCode = async (email: string, code: string) => {
    try {
      const { data, error } = await useFetch("/api/verification/verify", {
        method: "POST",
        body: { email: email.toLowerCase().trim(), code },
      });

      if (error.value) {
        console.error("Error al verificar código:", error.value);
        return {
          success: false,
          error: error.value,
          message: error.value.message,
        };
      }

      const payload = data.value as {
        success?: boolean;
        message?: string;
      } | null;

      return {
        success: payload?.success === true,
        message: payload?.message || "Error desconocido",
      };
    } catch (err) {
      console.error("Error inesperado al verificar código:", err);
      return { success: false, error: err, message: "Error inesperado" };
    }
  };

  return {
    requestVerificationCode,
    verifyCode,
  };
};
