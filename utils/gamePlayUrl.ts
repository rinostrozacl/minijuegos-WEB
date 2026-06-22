/** Dominios itch permitidos para reproducir en iframe (legacy). */
export const ITCH_PLAY_HOSTS = ["itch.io"] as const;

/** Hosts permitidos para reproducir el juego (iframe). */
export const GAME_PLAY_HOSTS = ["github.io", "itch.io"] as const;

/** CDN directo de itch — bloqueado por sitelock fuera de itch.io; no usar en iframe. */
export function isItchCdnPlayUrl(url: string): boolean {
  try {
    const h = new URL(url).hostname.toLowerCase();
    return (
      h.endsWith(".itch.zone") ||
      h.includes("hwcdn.net") ||
      h === "html-classic.itch.zone"
    );
  } catch {
    return false;
  }
}

export function isGithubPagesHost(hostname: string): boolean {
  const h = hostname.toLowerCase();
  return h === "github.io" || h.endsWith(".github.io");
}

export function isItchPageHost(hostname: string): boolean {
  const h = hostname.toLowerCase();
  return h.endsWith(".itch.io") && h !== "itch.io";
}

export function isAllowedItchInputUrl(raw: string): boolean {
  return normalizeItchInputUrl(raw) !== null;
}

export function isAllowedGithubPagesPlayUrl(raw: string): boolean {
  return normalizeGithubPagesPlayUrl(raw) !== null;
}

/** Normaliza URL de GitHub Pages para reproducir en iframe. */
export function normalizeGithubPagesPlayUrl(raw: string): string | null {
  let value = raw.trim();
  if (!value) return null;

  if (!/^https?:\/\//i.test(value)) {
    value = `https://${value}`;
  }

  try {
    const url = new URL(value);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;

    url.protocol = "https:";
    url.hash = "";
    url.search = "";

    if (!isGithubPagesHost(url.hostname)) return null;

    if (!url.pathname || url.pathname === "/") {
      url.pathname = "/";
    } else if (!url.pathname.endsWith("/") && !url.pathname.endsWith(".html")) {
      url.pathname = `${url.pathname}/`;
    }

    return url.toString();
  } catch {
    return null;
  }
}

/** Normaliza lo que pega el usuario (https, sin barra final, sin query de tracking). */
export function normalizeItchInputUrl(raw: string): string | null {
  let value = raw.trim();
  if (!value) return null;

  if (!/^https?:\/\//i.test(value)) {
    value = `https://${value}`;
  }

  try {
    const url = new URL(value);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;

    url.protocol = "https:";
    url.hash = "";
    url.search = "";

    const h = url.hostname.toLowerCase();
    if (h === "itch.io" && url.pathname.startsWith("/embed/")) {
      return url.toString();
    }
    if (isItchPageHost(h)) {
      if (url.pathname.endsWith("/") && url.pathname.length > 1) {
        url.pathname = url.pathname.slice(0, -1);
      }
      if (!url.pathname || url.pathname === "/") return null;
      return url.toString();
    }
  } catch {
    return null;
  }

  return null;
}

/** Atributo recomendado para iframes con builds WebGL embebidos. */
export const GAME_IFRAME_ALLOW =
  "fullscreen; autoplay; gamepad *; clipboard-read; clipboard-write";

/** @deprecated Usar GAME_IFRAME_ALLOW */
export const ITCH_IFRAME_ALLOW = GAME_IFRAME_ALLOW;

export function buildItchEmbedUrl(gameId: string | number): string {
  return `https://itch.io/embed/${gameId}?dark=true&border_width=0`;
}

function isAllowedPlayHostname(hostname: string): boolean {
  const h = hostname.toLowerCase();
  return GAME_PLAY_HOSTS.some(
    (allowed) => h === allowed || h.endsWith(`.${allowed}`)
  );
}

/**
 * Normaliza gameWebGLUrl almacenado en Firestore para reproducir en iframe.
 */
export function resolveGamePlayUrl(
  stored: string | null | undefined,
  itchGameId?: string | number | null
): string | null {
  if (!stored || !String(stored).trim()) {
    return null;
  }

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

    if (isItchCdnPlayUrl(value)) {
      return itchGameId ? buildItchEmbedUrl(itchGameId) : null;
    }

    if (isGithubPagesHost(h)) {
      return normalizeGithubPagesPlayUrl(value) || value;
    }

    if (h === "itch.io" && url.pathname.startsWith("/embed/")) {
      return value;
    }

    if (isAllowedPlayHostname(h)) {
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

export function isItchAnnexUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  try {
    const u = new URL(url);
    return isItchPageHost(u.hostname);
  } catch {
    return false;
  }
}
