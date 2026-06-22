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

const FETCH_TIMEOUT_MS = 12000;
const USER_AGENT =
  "Mozilla/5.0 (compatible; GameCraft2026/1.0; +https://gamecraft.cl)";

interface ItchDataJson {
  id?: number;
  errors?: string[];
  title?: string;
}

function extractGameIdFromHtml(html: string): string | null {
  const patterns = [
    /https?:\/\/itch\.io\/embed\/(\d+)/i,
    /<meta[^>]+name=["']itch:path["'][^>]+content=["']games\/(\d+)["']/i,
    /content=["']games\/(\d+)["'][^>]+name=["']itch:path["']/i,
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

async function fetchWithTimeout(
  url: string,
  init: RequestInit = {}
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "User-Agent": USER_AGENT,
        ...(init.headers || {}),
      },
    });
  } finally {
    clearTimeout(timeout);
  }
}

function buildResolution(pageUrl: string, gameId: string): ItchEmbedResolution {
  return {
    gameId,
    pageUrl,
    playUrl: buildItchEmbedUrl(gameId),
  };
}

async function fetchPageHtml(pageUrl: string): Promise<string> {
  let response: Response;
  try {
    response = await fetchWithTimeout(pageUrl, {
      headers: { Accept: "text/html" },
    });
  } catch (err: unknown) {
    const e = err as { name?: string };
    throw createError({
      statusCode: 400,
      statusMessage:
        e.name === "AbortError"
          ? "itch.io tardó demasiado en responder. Intenta de nuevo."
          : "No se pudo conectar con itch.io. Verifica la URL.",
    });
  }

  if (response.status === 404) {
    throw createError({
      statusCode: 400,
      statusMessage:
        "No encontramos esa página en itch.io. Revisa el usuario y el nombre del juego en la URL.",
    });
  }

  if (!response.ok) {
    throw createError({
      statusCode: 400,
      statusMessage: `No se pudo acceder a la página de itch.io (HTTP ${response.status}).`,
    });
  }

  const html = await response.text();

  if (/not_found_game_page|We couldn.?t find your page/i.test(html)) {
    throw createError({
      statusCode: 400,
      statusMessage:
        "No encontramos esa página en itch.io. Revisa el usuario y el nombre del juego en la URL.",
    });
  }

  return html;
}

async function resolveGameIdFromDataJson(
  pageUrl: string
): Promise<string | null> {
  const jsonUrl = `${pageUrl.replace(/\/$/, "")}/data.json`;

  let response: Response;
  try {
    response = await fetchWithTimeout(jsonUrl, {
      headers: { Accept: "application/json" },
    });
  } catch (err: unknown) {
    const e = err as { name?: string };
    if (e.name === "AbortError") {
      throw createError({
        statusCode: 400,
        statusMessage:
          "itch.io tardó demasiado en responder. Intenta de nuevo.",
      });
    }
    return null;
  }

  let payload: ItchDataJson;
  try {
    payload = (await response.json()) as ItchDataJson;
  } catch {
    return null;
  }

  if (payload.errors?.length) {
    throw createError({
      statusCode: 400,
      statusMessage:
        "No encontramos ese juego en itch.io. Verifica la URL (debe ser la página pública del juego, no el enlace de descarga) y que esté publicado.",
    });
  }

  if (payload.id && Number.isFinite(payload.id)) {
    return String(payload.id);
  }

  return null;
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
    return directEmbed;
  }

  const pageUrl = normalizePageUrl(trimmed);

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

  const gameIdFromJson = await resolveGameIdFromDataJson(pageUrl);
  let gameId = gameIdFromJson;

  if (!gameId) {
    const html = await fetchPageHtml(pageUrl);
    gameId = extractGameIdFromHtml(html);
  }

  if (!gameId) {
    throw createError({
      statusCode: 400,
      statusMessage:
        "No pudimos obtener el embed de itch.io. Verifica que el juego esté publicado como HTML5/WebGL jugable en el navegador.",
    });
  }

  return buildResolution(pageUrl, gameId);
}
