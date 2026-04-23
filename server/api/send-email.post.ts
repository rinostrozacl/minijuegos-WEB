import { sendServerEmail } from "../utils/email";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);

    if (!body?.to || !body?.subject || !body?.html) {
      return {
        success: false,
        message: "Faltan campos requeridos: to, subject, html",
      };
    }

    const result = await sendServerEmail(body.to, body.subject, body.html);

    if (!result.success) {
      const msg =
        typeof result.error === "string"
          ? result.error
          : "Error al enviar con Resend";
      return {
        success: false,
        message: msg,
      };
    }

    return { success: true, data: result.data };
  } catch (error) {
    console.error("Error al enviar email:", error);
    return {
      success: false,
      message: "Error interno al enviar el correo",
    };
  }
});
