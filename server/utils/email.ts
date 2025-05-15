/**
 * Utility functions for sending emails from the server
 */

/**
 * Sends an email using the Resend API
 * @param to Recipient email
 * @param subject Email subject
 * @param html Email HTML content
 */
export async function sendServerEmail(
  to: string,
  subject: string,
  html: string
) {
  try {
    const config = useRuntimeConfig();
    const apiKey = config.resendApiKey;

    if (!apiKey) {
      console.error("RESEND_API_KEY no está configurada");
      return {
        success: false,
        error: "API key de Resend no configurada",
      };
    }

    console.log(`Intentando enviar email a ${to} usando Resend API`);

    // Crear un AbortController para establecer un timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 segundos de timeout

    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          from: "GameCraft2025 <contacto@codepulse.cl>",
          to: [to],
          subject,
          html,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId); // Limpiar el timeout

      // Si la respuesta no es exitosa, intentamos obtener el cuerpo para depuración
      if (!response.ok) {
        try {
          const data = await response.json();
          console.error("Error al enviar email:", data);
          return { success: false, error: data };
        } catch (parseError) {
          console.error("Error al parsear respuesta de error:", parseError);
          return {
            success: false,
            error: `Error de Resend: ${response.status} ${response.statusText}`,
          };
        }
      }

      const data = await response.json();
      console.log("Email enviado correctamente:", data);
      return { success: true, data };
    } catch (fetchError: any) {
      clearTimeout(timeoutId); // Limpiar el timeout en caso de error

      // Manejar específicamente el error de timeout
      if (fetchError.name === "AbortError") {
        console.error("Timeout al conectar con Resend API");
        return {
          success: false,
          error:
            "Tiempo de espera agotado al conectar con el servicio de email",
        };
      }

      console.error("Error durante la petición a Resend API:", fetchError);
      return { success: false, error: fetchError };
    }
  } catch (error) {
    console.error("Error inesperado al enviar email:", error);
    return { success: false, error };
  }
}

/**
 * Sends a verification email with a code
 * @param to Recipient email
 * @param code Verification code
 */
export async function sendVerificationEmail(to: string, code: string) {
  console.log(`Enviando código de verificación a ${to}: ${code}`);

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

  return await sendServerEmail(to, subject, html);
}
