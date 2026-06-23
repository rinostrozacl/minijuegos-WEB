/** Resolución por defecto de plantillas Unity WebGL recientes. */
export const DEFAULT_GAME_CANVAS_WIDTH = 960;
export const DEFAULT_GAME_CANVAS_HEIGHT = 600;

/** Barra inferior Unity (fullscreen, logo, título) — no está en width/height del canvas. */
export const UNITY_WEBGL_FOOTER_HEIGHT = 52;

export interface GameCanvasSize {
  width: number;
  height: number;
}

export interface GameViewportSize extends GameCanvasSize {
  /** Altura extra bajo el canvas (footer Unity). */
  frameExtraHeight: number;
}

function parsePositiveInt(value: string | undefined): number | null {
  if (!value) return null;
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function extractFromCanvasTag(tag: string): GameCanvasSize | null {
  const width = parsePositiveInt(tag.match(/\bwidth\s*=\s*["']?(\d+)/i)?.[1]);
  const height = parsePositiveInt(
    tag.match(/\bheight\s*=\s*["']?(\d+)/i)?.[1]
  );
  if (width && height) return { width, height };
  return null;
}

/** Extrae width/height del index.html de un build Unity WebGL. */
export function extractGameResolutionFromHtml(html: string): GameCanvasSize | null {
  const unityCanvasMatch = html.match(
    /<canvas[^>]*\bid=["']?unity-canvas["']?[^>]*>/i
  );
  if (unityCanvasMatch) {
    const fromUnity = extractFromCanvasTag(unityCanvasMatch[0]);
    if (fromUnity) return fromUnity;
  }

  const anyCanvasMatch = html.match(/<canvas[^>]+>/i);
  if (anyCanvasMatch) {
    const fromCanvas = extractFromCanvasTag(anyCanvasMatch[0]);
    if (fromCanvas) return fromCanvas;
  }

  const styleMatch = html.match(
    /canvas\.style\.width\s*=\s*["'](\d+)px["'][\s\S]*?canvas\.style\.height\s*=\s*["'](\d+)px["']/i
  );
  if (styleMatch) {
    const width = parsePositiveInt(styleMatch[1]);
    const height = parsePositiveInt(styleMatch[2]);
    if (width && height) return { width, height };
  }

  const styleMatchReverse = html.match(
    /canvas\.style\.height\s*=\s*["'](\d+)px["'][\s\S]*?canvas\.style\.width\s*=\s*["'](\d+)px["']/i
  );
  if (styleMatchReverse) {
    const height = parsePositiveInt(styleMatchReverse[1]);
    const width = parsePositiveInt(styleMatchReverse[2]);
    if (width && height) return { width, height };
  }

  return null;
}

/** Detecta si el build incluye la barra inferior de Unity WebGL. */
export function extractUnityFrameExtraHeight(html: string): number {
  if (
    /id=["']unity-footer["']/i.test(html) ||
    /id=["']unity-fullscreen-button["']/i.test(html)
  ) {
    return UNITY_WEBGL_FOOTER_HEIGHT;
  }
  return 0;
}

export function resolveGameViewportFromHtml(html: string): GameViewportSize {
  const canvas = extractGameResolutionFromHtml(html);
  const frameExtraHeight = extractUnityFrameExtraHeight(html);
  const { width, height } = normalizeGameCanvasSize(
    canvas?.width,
    canvas?.height
  );
  return { width, height, frameExtraHeight };
}

export function normalizeGameCanvasSize(
  width?: number | null,
  height?: number | null
): GameCanvasSize {
  const w = parsePositiveInt(width?.toString()) ?? DEFAULT_GAME_CANVAS_WIDTH;
  const h = parsePositiveInt(height?.toString()) ?? DEFAULT_GAME_CANVAS_HEIGHT;
  return { width: w, height: h };
}

/** Contenedor centrado: canvas + barra Unity (fullscreen, etc.). */
export function getGameIframeContainerStyle(
  width?: number | null,
  height?: number | null,
  maxHeightVh = 70,
  frameExtraHeight?: number | null
): Record<string, string> {
  const { width: w, height: h } = normalizeGameCanvasSize(width, height);
  const chrome =
    frameExtraHeight != null ? frameExtraHeight : UNITY_WEBGL_FOOTER_HEIGHT;
  const viewportH = h + chrome;

  return {
    aspectRatio: `${w} / ${viewportH}`,
    width: "100%",
    maxWidth: `min(100%, ${w}px)`,
    maxHeight: `min(${maxHeightVh}vh, calc(100vw * ${viewportH} / ${w}))`,
    margin: "0 auto",
  };
}
