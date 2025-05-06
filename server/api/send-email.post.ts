export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const apiKey = config.resendApiKey;

  try {
    const body = await readBody(event);

    if (!body.to || !body.subject || !body.html) {
      return {
        statusCode: 400,
        body: "Faltan campos requeridos: to, subject, html",
      };
    }

    // Simple implementación sin dependencias de React
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: "EVA Videojuegos <onboarding@resend.dev>", // Cambiar al dominio verificado
        to: [body.to],
        subject: body.subject,
        html: body.html,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Error al enviar email:", data);
      return {
        statusCode: response.status,
        body: JSON.stringify(data),
      };
    }

    return data;
  } catch (error) {
    console.error("Error al enviar email:", error);
    return {
      statusCode: 500,
      body: JSON.stringify(error),
    };
  }
});
