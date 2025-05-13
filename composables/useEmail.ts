/**
 * Composable para enviar emails a través de la API de Resend
 */
export const useEmail = () => {
  /**
   * Envía un email usando el endpoint de la API
   * @param to Dirección de correo del destinatario
   * @param subject Asunto del correo
   * @param html Contenido HTML del correo
   * @returns Resultado de la operación
   */
  const sendEmail = async (to: string, subject: string, html: string) => {
    try {
      const { data: response, error } = await useFetch("/api/send-email", {
        method: "POST",
        body: {
          to,
          subject,
          html,
        },
      });

      if (error.value) {
        console.error("Error al enviar email:", error.value);
        return { success: false, error: error.value };
      }

      return { success: true, data: response.value };
    } catch (err) {
      console.error("Error inesperado al enviar email:", err);
      return { success: false, error: err };
    }
  };

  /**
   * Envía un email de verificación con un código
   * @param to Dirección de correo del destinatario
   * @param code Código de verificación
   * @returns Resultado de la operación
   */
  const sendVerificationEmail = async (to: string, code: string) => {
    const subject = "Verifica tu correo - GameCraft2025";
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #22c55e; margin-bottom: 20px;">Verificación de Correo</h1>
        <p>Gracias por registrarte en la plataforma GameCraft2025. Para completar tu registro, por favor usa el siguiente código de verificación:</p>
        <div style="background-color: #f3f4f6; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
          ${code}
        </div>
        <p>Si no solicitaste este código, puedes ignorar este mensaje.</p>
        <p>Saludos,<br>El equipo de GameCraft2025</p>
      </div>
    `;

    return await sendEmail(to, subject, html);
  };

  /**
   * Solicita un código de verificación a través del servidor
   * @param email Dirección de correo para verificar
   * @returns Resultado de la operación
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
        return { success: false, error: error.value };
      }

      return { success: true, data: data.value };
    } catch (err) {
      console.error("Error inesperado al solicitar verificación:", err);
      return { success: false, error: err };
    }
  };

  /**
   * Verifica un código ingresado por el usuario
   * @param email Dirección de correo asociada al código
   * @param code Código ingresado por el usuario
   * @returns Resultado de la operación
   */
  const verifyCode = async (email: string, code: string) => {
    try {
      const { data, error } = await useFetch("/api/verification/verify", {
        method: "POST",
        body: { email, code },
      });

      if (error.value) {
        console.error("Error al verificar código:", error.value);
        return {
          success: false,
          error: error.value,
          message: error.value.message,
        };
      }

      return {
        success: data.value?.success || false,
        message: data.value?.message || "Error desconocido",
      };
    } catch (err) {
      console.error("Error inesperado al verificar código:", err);
      return { success: false, error: err, message: "Error inesperado" };
    }
  };

  return {
    sendEmail,
    sendVerificationEmail,
    requestVerificationCode,
    verifyCode,
  };
};
