/**
 * Estados canónicos de juego en GameCraft (Firestore `gameStatus`).
 * Se normalizan valores legacy al leer/escribir.
 */
export const GAME_STATUS = {
  BORRADOR: "borrador",
  EN_DESARROLLO: "en_desarrollo",
  PUBLICADO: "publicado",
} as const;

export type GameStatusCanonical =
  (typeof GAME_STATUS)[keyof typeof GAME_STATUS];

export function normalizeGameStatus(
  raw: string | undefined | null
): GameStatusCanonical {
  if (!raw) return GAME_STATUS.BORRADOR;
  const s = String(raw).trim();
  if (s === GAME_STATUS.PUBLICADO || s === "publicado") {
    return GAME_STATUS.PUBLICADO;
  }
  if (
    s === GAME_STATUS.EN_DESARROLLO ||
    s === "en_desarrollo" ||
    s === "in_progress"
  ) {
    return GAME_STATUS.EN_DESARROLLO;
  }
  if (
    s === GAME_STATUS.BORRADOR ||
    s === "borrador" ||
    s === "not_started" ||
    s === "no_iniciado"
  ) {
    return GAME_STATUS.BORRADOR;
  }
  return GAME_STATUS.BORRADOR;
}

export function isPublishedStatus(
  s: string | undefined | null
): boolean {
  return normalizeGameStatus(s) === GAME_STATUS.PUBLICADO;
}

export function gameStatusLabel(s: string | undefined | null): string {
  const n = normalizeGameStatus(s);
  if (n === GAME_STATUS.PUBLICADO) return "Publicado";
  if (n === GAME_STATUS.EN_DESARROLLO) return "En desarrollo";
  return "Borrador";
}

export function gameStatusColor(
  s: string | undefined | null
): "green" | "amber" | "gray" {
  const n = normalizeGameStatus(s);
  if (n === GAME_STATUS.PUBLICADO) return "green";
  if (n === GAME_STATUS.EN_DESARROLLO) return "amber";
  return "gray";
}
