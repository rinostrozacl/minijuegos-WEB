export function getClientIp(event: {
  node: {
    req: {
      headers: Record<string, string | string[] | undefined>;
      socket?: { remoteAddress?: string };
    };
  };
}): string {
  const forwarded = event.node.req.headers["x-forwarded-for"];
  const raw = Array.isArray(forwarded) ? forwarded[0] : forwarded;
  if (raw) return raw.split(",")[0].trim();
  return event.node.req.socket?.remoteAddress || "unknown";
}
