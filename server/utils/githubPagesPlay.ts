import { normalizeGithubPagesPlayUrl } from "~/utils/gamePlayUrl";
import {
  resolveGameViewportFromHtml,
  type GameViewportSize,
} from "~/utils/gameResolution";

export interface GithubPagesValidation {
  playUrl: string;
  canvasWidth: number;
  canvasHeight: number;
  frameExtraHeight: number;
}

const FETCH_TIMEOUT_MS = 12000;
const USER_AGENT =
  "Mozilla/5.0 (compatible; GameCraft2026/1.0; +https://gamecraft.cl)";

function isGithub404Page(html: string): boolean {
  return (
    /There isn't a GitHub Pages site here/i.test(html) ||
    /404.*File not found/i.test(html) ||
    /Page not found/i.test(html)
  );
}

/** Unity WebGL con Brotli (.br) no funciona en GitHub Pages (falta Content-Encoding: br). */
function detectUnityBrotliBuild(html: string): boolean {
  return /\.(data|wasm|framework\.js)\.br["']/i.test(html);
}

function brotliBuildErrorMessage(): string {
  return (
    "El build usa compresión Brotli (.br). GitHub Pages no envía el encabezado " +
    "Content-Encoding: br y el juego no carga. En Unity: Edit → Project Settings → " +
    "Player → WebGL → Publishing Settings → Compression Format → Disabled. " +
    "Vuelve a exportar y sube los archivos a testjuego/."
  );
}

function looksLikeHtml(contentType: string | null, body: string): boolean {
  if (contentType?.includes("text/html")) return true;
  return /<html[\s>]/i.test(body) || /<!DOCTYPE html/i.test(body);
}

async function fetchWithTimeout(url: string): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    return await fetch(url, {
      method: "GET",
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "text/html,application/xhtml+xml",
      },
      signal: controller.signal,
      redirect: "follow",
    });
  } finally {
    clearTimeout(timeout);
  }
}

async function probePlayUrl(
  candidate: string
): Promise<{ html: string } | false> {
  let response: Response;
  try {
    response = await fetchWithTimeout(candidate);
  } catch (err: unknown) {
    const e = err as { name?: string };
    if (e.name === "AbortError") {
      throw createError({
        statusCode: 400,
        statusMessage:
          "GitHub Pages tardó demasiado en responder. Intenta de nuevo.",
      });
    }
    return false;
  }

  if (response.status === 404) return false;

  if (!response.ok) {
    throw createError({
      statusCode: 400,
      statusMessage: `No se pudo acceder a la URL (HTTP ${response.status}).`,
    });
  }

  const body = await response.text();
  if (isGithub404Page(body)) return false;
  if (looksLikeHtml(response.headers.get("content-type"), body)) {
    if (detectUnityBrotliBuild(body)) {
      throw createError({
        statusCode: 400,
        statusMessage: brotliBuildErrorMessage(),
      });
    }
    return { html: body };
  }
  return false;
}

function resolveCanvasSize(html: string): GameViewportSize {
  return resolveGameViewportFromHtml(html);
}

export async function validateGithubPagesPlayUrl(
  input: string
): Promise<GithubPagesValidation> {
  const playUrl = normalizeGithubPagesPlayUrl(input);

  if (!playUrl) {
    throw createError({
      statusCode: 400,
      statusMessage:
        "URL inválida. Usa una URL de GitHub Pages (https://usuario.github.io/repositorio/).",
    });
  }

  const candidates = [playUrl];
  const parsed = new URL(playUrl);
  if (!parsed.pathname.endsWith("index.html")) {
    const base = playUrl.endsWith("/") ? playUrl : `${playUrl}/`;
    candidates.push(`${base}index.html`);
  }

  for (const candidate of candidates) {
    const probed = await probePlayUrl(candidate);
    if (probed) {
      const canvas = resolveCanvasSize(probed.html);
      const finalUrl = candidate.endsWith("index.html") ? candidate : playUrl;
      return {
        playUrl: finalUrl,
        canvasWidth: canvas.width,
        canvasHeight: canvas.height,
        frameExtraHeight: canvas.frameExtraHeight,
      };
    }
  }

  throw createError({
    statusCode: 400,
    statusMessage:
      "No encontramos un juego publicado en esa URL. Verifica que GitHub Pages esté activo y que exista index.html en la carpeta publicada.",
  });
}
