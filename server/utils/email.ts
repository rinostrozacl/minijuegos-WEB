/**
 * Envío de correo transaccional vía Resend (solo plantillas del servidor).
 */

const ALLOWED_SUBJECTS = new Set([
  "Verifica tu correo - GameCraft2026",
]);

const MAX_HTML_LENGTH = 32_000;

const BLOCKED_HTML_PATTERNS = [
  /honeypot/i,
  /dhlpass\.dhl\.com/i,
  /<script\b/i,
  /javascript:/i,
  /t\.co\//i,
];

function assertSafeOutboundEmail(to: string, subject: string, html: string): void {
  const recipient = to.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient)) {
    throw createError({ statusCode: 400, statusMessage: "Correo destinatario inválido" });
  }
  if (!ALLOWED_SUBJECTS.has(subject)) {
    console.error("[email] Bloqueado asunto no permitido:", subject);
    throw createError({ statusCode: 403, statusMessage: "Tipo de correo no permitido" });
  }
  if (html.length > MAX_HTML_LENGTH) {
    console.error("[email] Bloqueado HTML demasiado largo:", html.length);
    throw createError({ statusCode: 403, statusMessage: "Contenido de correo no permitido" });
  }
  if (BLOCKED_HTML_PATTERNS.some((pattern) => pattern.test(html))) {
    console.error("[email] Bloqueado contenido sospechoso hacia", recipient);
    throw createError({ statusCode: 403, statusMessage: "Contenido de correo no permitido" });
  }
}

/**
 * Envía un correo transaccional usando la API de Resend.
 * Solo asuntos y plantillas generadas en el servidor están permitidos.
 */
export async function sendServerEmail(to: string, subject: string, html: string) {
  try {
    assertSafeOutboundEmail(to, subject, html);

    const config = useRuntimeConfig();
    const apiKey =
      (config.resendApiKey as string)?.trim() ||
      process.env.RESEND_API_KEY?.trim() ||
      process.env.NUXT_RESEND_API_KEY?.trim();

    if (!apiKey) {
      console.error("RESEND_API_KEY no está configurada");
      return {
        success: false,
        error: "API key de Resend no configurada",
      };
    }

    const from =
      (config.resendFromEmail as string)?.trim() ||
      process.env.RESEND_FROM_EMAIL?.trim() ||
      process.env.NUXT_RESEND_FROM_EMAIL?.trim() ||
      "GameCraft2026 <onboarding@resend.dev>";

    console.log(`[email] Enviando a ${to} (asunto: ${subject})`);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          from,
          to: [to.trim()],
          subject,
          html,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        try {
          const data = (await response.json()) as Record<string, unknown>;
          console.error("Error al enviar email:", data);
          const msg =
            typeof data?.message === "string"
              ? data.message
              : `Resend ${response.status}`;
          return { success: false, error: msg, details: data };
        } catch (parseError) {
          console.error("Error al parsear respuesta de error:", parseError);
          return {
            success: false,
            error: `Error de Resend: ${response.status} ${response.statusText}`,
          };
        }
      }

      const data = await response.json();
      console.log("[email] Enviado correctamente:", data);
      return { success: true, data };
    } catch (fetchError: unknown) {
      clearTimeout(timeoutId);

      if (fetchError instanceof Error && fetchError.name === "AbortError") {
        console.error("Timeout al conectar con Resend API");
        return {
          success: false,
          error: "Tiempo de espera agotado al conectar con el servicio de email",
        };
      }

      console.error("Error durante la petición a Resend API:", fetchError);
      return { success: false, error: fetchError };
    }
  } catch (error) {
    if (error && typeof error === "object" && "statusCode" in error) {
      throw error;
    }
    console.error("Error inesperado al enviar email:", error);
    return { success: false, error };
  }
}

export async function sendVerificationEmail(to: string, code: string) {
  const subject = "Verifica tu correo - GameCraft2026";
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #22c55e; margin-bottom: 20px;">Verificación de Correo</h1>
      <p>Gracias por registrarte en la plataforma GameCraft2026. Para completar tu registro, por favor usa el siguiente código de verificación:</p>
      <div style="background-color: #f3f4f6; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
        ${code}
      </div>
      <p>Si no solicitaste este código, puedes ignorar este mensaje.</p>
      <p>Saludos,<br>El equipo de GameCraft2026</p>
    </div>
  `;

  return await sendServerEmail(to, subject, html);
}
