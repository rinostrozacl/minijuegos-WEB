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
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Error al enviar email:", data);
      return { success: false, error: data };
    }

    return { success: true, data };
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
