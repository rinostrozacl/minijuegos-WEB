export default defineEventHandler(async (event) => {
  try {
    // Obtener IP del usuario
    const forwarded = getHeader(event, "x-forwarded-for");
    const realIp = getHeader(event, "x-real-ip");
    const remoteAddress = getClientIP(event);

    // Priorizar las IPs en orden: x-forwarded-for, x-real-ip, remote address
    let clientIP = remoteAddress;

    if (forwarded) {
      // x-forwarded-for puede contener múltiples IPs separadas por comas
      clientIP = forwarded.split(",")[0].trim();
    } else if (realIp) {
      clientIP = realIp;
    }

    return {
      ip: clientIP,
      timestamp: new Date().toISOString(),
      userAgent: getHeader(event, "user-agent") || "unknown",
      referer: getHeader(event, "referer") || "direct",
    };
  } catch (error) {
    console.error("[API] Error getting user info:", error);

    return {
      ip: "unknown",
      timestamp: new Date().toISOString(),
      userAgent: "unknown",
      referer: "unknown",
    };
  }
});
