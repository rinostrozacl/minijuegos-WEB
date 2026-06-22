/** Dominios itch permitidos para reproducir en iframe. */
export const ITCH_PLAY_HOSTS = [
  "itch.io",
  "html-classic.itch.zone",
] as const;

export function isItchPageHost(hostname: string): boolean {
  const h = hostname.toLowerCase();
  return h.endsWith(".itch.io") && h !== "itch.io";
}

export function isAllowedItchInputUrl(raw: string): boolean {
  try {
    const url = new URL(raw.trim());
    if (url.protocol !== "https:") return false;
    const h = url.hostname.toLowerCase();
    if (h === "itch.io" && url.pathname.startsWith("/embed/")) return true;
    return isItchPageHost(h);
  } catch {
    return false;
  }
}

export function buildItchEmbedUrl(gameId: string | number): string {
  return `https://itch.io/embed/${gameId}?dark=true`;
}

/**
 * Normaliza gameWebGLUrl almacenado en Firestore para reproducir en iframe.
 */
export function resolveGamePlayUrl(
  stored: string | null | undefined
): string | null {
  if (!stored || !String(stored).trim()) return null;

  const value = String(stored).trim();

  if (value.startsWith("/games/")) {
    return value;
  }

  try {
    const url = new URL(value);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;

    if (url.pathname.startsWith("/games/")) {
      return url.pathname;
    }

    const h = url.hostname.toLowerCase();
    if (h === "itch.io" && url.pathname.startsWith("/embed/")) {
      return value;
    }
    if (
      ITCH_PLAY_HOSTS.some(
        (allowed) => h === allowed || h.endsWith(`.${allowed}`)
      )
    ) {
      return value;
    }
  } catch {
    return null;
  }

  return null;
}

export function isItchEmbedUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  try {
    const u = new URL(url);
    return (
      u.hostname.toLowerCase() === "itch.io" &&
      u.pathname.startsWith("/embed/")
    );
  } catch {
    return false;
  }
}
