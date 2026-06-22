import {
  buildItchEmbedUrl,
  isAllowedItchInputUrl,
  isItchPageHost,
} from "~/utils/gamePlayUrl";

export interface ItchEmbedResolution {
  gameId: string;
  pageUrl: string;
  playUrl: string;
}

const FETCH_TIMEOUT_MS = 8000;
const USER_AGENT = "GameCraft2026/1.0 (+https://gamecraft.cl)";

function extractGameIdFromHtml(html: string): string | null {
  const patterns = [
    /https?:\/\/itch\.io\/embed\/(\d+)/i,
    /data-game_id=["'](\d+)["']/i,
    /"game_id"\s*:\s*(\d+)/i,
    /game_id['"]\s*:\s*(\d+)/i,
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) return match[1];
  }

  return null;
}

function normalizePageUrl(input: string): string {
  const url = new URL(input.trim());
  url.hash = "";
  if (url.pathname.endsWith("/") && url.pathname.length > 1) {
    url.pathname = url.pathname.slice(0, -1);
  }
  return url.toString();
}

function parseEmbedUrl(input: string): ItchEmbedResolution | null {
  try {
    const url = new URL(input.trim());
    const match = url.pathname.match(/^\/embed\/(\d+)/);
    if (!match?.[1] || url.hostname.toLowerCase() !== "itch.io") {
      return null;
    }
    const gameId = match[1];
    return {
      gameId,
      pageUrl: input.trim(),
      playUrl: buildItchEmbedUrl(gameId),
    };
  } catch {
    return null;
  }
}

export async function resolveItchEmbedFromPageUrl(
  input: string
): Promise<ItchEmbedResolution> {
  const trimmed = input.trim();

  if (!isAllowedItchInputUrl(trimmed)) {
    throw createError({
      statusCode: 400,
      statusMessage:
        "URL inválida. Usa la página pública de tu juego en itch.io (ej. https://usuario.itch.io/mi-juego).",
    });
  }

  const directEmbed = parseEmbedUrl(trimmed);
  if (directEmbed) {
    return {
      ...directEmbed,
      playUrl: buildItchEmbedUrl(directEmbed.gameId),
    };
  }

  const pageUrl = normalizePageUrl(trimmed);

  let html: string;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    const response = await fetch(pageUrl, {
      method: "GET",
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "text/html",
      },
      signal: controller.signal,
      redirect: "follow",
    });

    clearTimeout(timeout);

    if (!response.ok) {
      throw createError({
        statusCode: 400,
        statusMessage: `No se pudo acceder a la página de itch.io (HTTP ${response.status}).`,
      });
    }

    html = await response.text();
  } catch (err: unknown) {
    const e = err as { statusCode?: number; statusMessage?: string; name?: string };
    if (e.statusCode) throw err;
    throw createError({
      statusCode: 400,
      statusMessage:
        e.name === "AbortError"
          ? "itch.io tardó demasiado en responder. Intenta de nuevo."
          : "No se pudo conectar con itch.io. Verifica la URL.",
    });
  }

  const gameId = extractGameIdFromHtml(html);
  if (!gameId) {
    throw createError({
      statusCode: 400,
      statusMessage:
        "No pudimos obtener el embed de itch.io. Verifica que el juego esté publicado y sea HTML5/WebGL jugable en el navegador.",
    });
  }

  try {
    const parsed = new URL(pageUrl);
    if (!isItchPageHost(parsed.hostname)) {
      throw new Error("not a page host");
    }
  } catch {
    throw createError({
      statusCode: 400,
      statusMessage: "URL de página itch.io inválida.",
    });
  }

  return {
    gameId,
    pageUrl,
    playUrl: buildItchEmbedUrl(gameId),
  };
}
