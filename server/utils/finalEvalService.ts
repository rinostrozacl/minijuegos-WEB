import { randomUUID } from "node:crypto";
import { FieldValue } from "firebase-admin/firestore";
import { getFirestoreDb } from "../plugins/firebase-admin";
import {
  averageFinalEvalScores,
  emailToDocId,
  normalizeFinalEvalEmail,
  ratingDocId,
  type FinalEvalConfigDoc,
  type FinalEvalScores,
  type FinalEvalStatus,
} from "./finalEvalTypes";

function isPublishedGameStatus(raw: string | undefined | null): boolean {
  const s = String(raw || "").trim();
  return s === "publicado";
}

const CONFIG_PATH = { collection: "finalEvalConfig", id: "system" };
const SESSION_HOURS = 24;
const OTP_EXPIRE_MIN = 15;
const OTP_MAX_REQUESTS = 3;
const OTP_REQUEST_WINDOW_MS = 15 * 60 * 1000;
const IP_MAX_REQUESTS = 10;
const IP_WINDOW_MS = 60 * 60 * 1000;

export function getFinalEvalDb() {
  return getFirestoreDb();
}

export async function getFinalEvalConfig(): Promise<FinalEvalConfigDoc> {
  const db = getFinalEvalDb();
  const snap = await db.collection(CONFIG_PATH.collection).doc(CONFIG_PATH.id).get();
  if (!snap.exists) {
    return {
      status: "cerrada",
      introText: "",
      lowVotesThreshold: 3,
      updatedAt: new Date(),
    };
  }
  const d = snap.data()!;
  return {
    status: (d.status as FinalEvalStatus) || "cerrada",
    introText: String(d.introText || ""),
    lowVotesThreshold: typeof d.lowVotesThreshold === "number" ? d.lowVotesThreshold : 3,
    updatedAt: d.updatedAt,
    updatedBy: d.updatedBy,
  };
}

export async function ensureFinalEvalConfigDoc() {
  const db = getFinalEvalDb();
  const ref = db.collection(CONFIG_PATH.collection).doc(CONFIG_PATH.id);
  const snap = await ref.get();
  if (!snap.exists) {
    await ref.set({
      status: "cerrada",
      introText:
        "Resultados de la evaluación final GameCraft2026. Cada juego fue calificado en Historia, Gráfica, Mecánica y General (escala 1–5).",
      lowVotesThreshold: 3,
      updatedAt: FieldValue.serverTimestamp(),
      updatedBy: "system",
    });
  }
}

export async function assertFinalEvalOpen(): Promise<FinalEvalConfigDoc> {
  const config = await getFinalEvalConfig();
  if (config.status !== "abierta") {
    throw createError({
      statusCode: 403,
      statusMessage: "La evaluación final no está abierta",
    });
  }
  return config;
}

export async function isEmailInFinalEvalAllowlist(email: string): Promise<boolean> {
  const normalized = normalizeFinalEvalEmail(email);
  const db = getFinalEvalDb();
  const docId = emailToDocId(normalized);
  const snap = await db.collection("finalEvalAllowedEmails").doc(docId).get();
  if (!snap.exists) return false;
  const d = snap.data();
  return d?.enabled !== false && normalizeFinalEvalEmail(String(d?.email || "")) === normalized;
}

function hashIp(ip: string): string {
  let h = 0;
  for (let i = 0; i < ip.length; i++) {
    h = (h << 5) - h + ip.charCodeAt(i);
    h &= h;
  }
  return Math.abs(h).toString(16);
}

export function getClientIp(event: {
  node: { req: { headers: Record<string, string | string[] | undefined>; socket?: { remoteAddress?: string } } };
}): string {
  const forwarded = event.node.req.headers["x-forwarded-for"];
  const raw = Array.isArray(forwarded) ? forwarded[0] : forwarded;
  if (raw) return raw.split(",")[0].trim();
  return event.node.req.socket?.remoteAddress || "unknown";
}

export async function checkOtpRateLimit(email: string, ip: string): Promise<void> {
  const db = getFinalEvalDb();
  const normalized = normalizeFinalEvalEmail(email);
  const now = Date.now();

  const otpSnap = await db.collection("finalEvalOtp").doc(normalized).get();
  if (otpSnap.exists) {
    const d = otpSnap.data()!;
    const windowStart = d.requestWindowStart?.toDate?.() || d.requestWindowStart;
    const windowMs = windowStart instanceof Date ? windowStart.getTime() : 0;
    let requestCount = Number(d.requestCount || 0);
    if (now - windowMs > OTP_REQUEST_WINDOW_MS) {
      requestCount = 0;
    }
    if (requestCount >= OTP_MAX_REQUESTS) {
      throw createError({
        statusCode: 429,
        statusMessage: "Demasiadas solicitudes. Intenta más tarde.",
      });
    }
  }

  const ipHash = hashIp(ip);
  const ipRef = db.collection("finalEvalOtpRateLimit").doc(ipHash);
  const ipSnap = await ipRef.get();
  if (ipSnap.exists) {
    const d = ipSnap.data()!;
    const windowStart = d.windowStart?.toDate?.() || d.windowStart;
    const windowMs = windowStart instanceof Date ? windowStart.getTime() : 0;
    let count = Number(d.count || 0);
    if (now - windowMs > IP_WINDOW_MS) {
      count = 0;
    }
    if (count >= IP_MAX_REQUESTS) {
      throw createError({
        statusCode: 429,
        statusMessage: "Demasiadas solicitudes. Intenta más tarde.",
      });
    }
  }
}

export async function recordOtpRequest(email: string, ip: string): Promise<void> {
  const db = getFinalEvalDb();
  const normalized = normalizeFinalEvalEmail(email);
  const now = new Date();
  const otpRef = db.collection("finalEvalOtp").doc(normalized);

  const otpSnap = await otpRef.get();
  let requestCount = 1;
  let requestWindowStart = now;
  if (otpSnap.exists) {
    const d = otpSnap.data()!;
    const windowStart = d.requestWindowStart?.toDate?.() || d.requestWindowStart;
    const windowMs = windowStart instanceof Date ? windowStart.getTime() : 0;
    if (Date.now() - windowMs <= OTP_REQUEST_WINDOW_MS) {
      requestCount = Number(d.requestCount || 0) + 1;
      requestWindowStart = windowStart instanceof Date ? windowStart : now;
    }
  }

  await otpRef.set(
    {
      email: normalized,
      requestCount,
      requestWindowStart,
      lastRequestAt: now,
    },
    { merge: true }
  );

  const ipHash = hashIp(ip);
  const ipRef = db.collection("finalEvalOtpRateLimit").doc(ipHash);
  const ipSnap = await ipRef.get();
  let count = 1;
  let windowStart = now;
  if (ipSnap.exists) {
    const d = ipSnap.data()!;
    const ws = d.windowStart?.toDate?.() || d.windowStart;
    const windowMs = ws instanceof Date ? ws.getTime() : 0;
    if (Date.now() - windowMs <= IP_WINDOW_MS) {
      count = Number(d.count || 0) + 1;
      windowStart = ws instanceof Date ? ws : now;
    }
  }
  await ipRef.set({ count, windowStart, lastAt: now }, { merge: true });
}

export async function createFinalEvalOtp(email: string): Promise<string> {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + OTP_EXPIRE_MIN * 60 * 1000);
  const normalized = normalizeFinalEvalEmail(email);
  const db = getFinalEvalDb();
  await db.collection("finalEvalOtp").doc(normalized).set(
    {
      email: normalized,
      code,
      attempts: 0,
      expiresAt,
      verifiedAt: null,
    },
    { merge: true }
  );
  return code;
}

export async function verifyFinalEvalOtp(
  email: string,
  code: string
): Promise<{ sessionId: string; expiresAt: Date }> {
  const normalized = normalizeFinalEvalEmail(email);
  const db = getFinalEvalDb();
  const docRef = db.collection("finalEvalOtp").doc(normalized);
  const snap = await docRef.get();

  if (!snap.exists) {
    throw createError({
      statusCode: 400,
      statusMessage: "Código inválido o expirado",
    });
  }

  const data = snap.data()!;
  const expiresAt = data.expiresAt?.toDate?.() || new Date(data.expiresAt);
  if (new Date() > expiresAt) {
    throw createError({
      statusCode: 400,
      statusMessage: "El código ha expirado",
    });
  }

  const attempts = Number(data.attempts || 0) + 1;
  await docRef.update({ attempts });

  if (attempts > 3) {
    throw createError({
      statusCode: 400,
      statusMessage: "Has excedido el número máximo de intentos",
    });
  }

  if (String(data.code) !== String(code).trim()) {
    throw createError({
      statusCode: 400,
      statusMessage: "Código incorrecto",
    });
  }

  await docRef.update({ verifiedAt: FieldValue.serverTimestamp() });

  const sessionId = randomUUID();
  const sessionExpires = new Date(Date.now() + SESSION_HOURS * 60 * 60 * 1000);
  await db.collection("finalEvalSessions").doc(sessionId).set({
    email: normalized,
    expiresAt: sessionExpires,
    createdAt: FieldValue.serverTimestamp(),
  });

  return { sessionId, expiresAt: sessionExpires };
}

export async function resolveSessionEmail(sessionId: string): Promise<string> {
  const db = getFinalEvalDb();
  const snap = await db.collection("finalEvalSessions").doc(sessionId).get();
  if (!snap.exists) {
    throw createError({ statusCode: 401, statusMessage: "Sesión inválida" });
  }
  const d = snap.data()!;
  const expiresAt = d.expiresAt?.toDate?.() || new Date(d.expiresAt);
  if (new Date() > expiresAt) {
    throw createError({ statusCode: 401, statusMessage: "Sesión expirada" });
  }
  return normalizeFinalEvalEmail(String(d.email));
}

export async function resolveEvaluatorUidByEmail(email: string): Promise<string | null> {
  const db = getFinalEvalDb();
  const normalized = normalizeFinalEvalEmail(email);
  const usersSnap = await db
    .collection("users")
    .where("email", "==", normalized)
    .limit(1)
    .get();
  if (usersSnap.empty) return null;
  return usersSnap.docs[0].id;
}

export async function assertNotSelfVote(
  evaluatorEmail: string,
  gameId: string,
  evaluatorUid?: string | null
): Promise<void> {
  const db = getFinalEvalDb();
  const themeSnap = await db.collection("themes").doc(gameId).get();
  if (!themeSnap.exists) {
    throw createError({ statusCode: 404, statusMessage: "Juego no encontrado" });
  }
  const theme = themeSnap.data()!;
  let uid = evaluatorUid || null;
  if (!uid) {
    uid = await resolveEvaluatorUidByEmail(evaluatorEmail);
  }
  if (!uid) return;

  if (theme.reservedById === uid || theme.teammateUid === uid) {
    throw createError({
      statusCode: 403,
      statusMessage: "No puedes calificar tu propio juego ni el de tu compañero",
    });
  }
}

export async function assertPublishedGame(gameId: string) {
  const db = getFinalEvalDb();
  const snap = await db.collection("themes").doc(gameId).get();
  if (!snap.exists) {
    throw createError({ statusCode: 404, statusMessage: "Juego no encontrado" });
  }
  const d = snap.data()!;
  if (!isPublishedGameStatus(d.gameStatus)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Solo se pueden calificar juegos publicados",
    });
  }
  return d;
}

export async function submitFinalEvalRating(params: {
  email: string;
  gameId: string;
  scores: FinalEvalScores;
  evaluatorUid?: string;
}): Promise<void> {
  await assertFinalEvalOpen();
  await assertPublishedGame(params.gameId);
  await assertNotSelfVote(params.email, params.gameId, params.evaluatorUid);

  const allowed = await isEmailInFinalEvalAllowlist(params.email);
  if (!allowed) {
    throw createError({
      statusCode: 403,
      statusMessage: "No estás autorizado para evaluar",
    });
  }

  const db = getFinalEvalDb();
  const docId = ratingDocId(params.email, params.gameId);
  const ref = db.collection("finalEvalRatings").doc(docId);
  const existing = await ref.get();
  if (existing.exists) {
    throw createError({
      statusCode: 409,
      statusMessage: "Ya calificaste este juego",
    });
  }

  await ref.set({
    email: normalizeFinalEvalEmail(params.email),
    gameId: params.gameId,
    scores: params.scores,
    submittedAt: FieldValue.serverTimestamp(),
    ...(params.evaluatorUid ? { evaluatorUid: params.evaluatorUid } : {}),
  });
}

export function displayGameTitle(theme: Record<string, unknown>): string {
  const gt = String(theme.gameTitle || "").trim();
  return gt || String(theme.title || "Sin título");
}

export async function getPublishedGameIds(): Promise<string[]> {
  const db = getFinalEvalDb();
  const snap = await db.collection("themes").where("gameStatus", "==", "publicado").get();
  return snap.docs.map((d) => d.id);
}

export async function aggregateFinalEvalResults() {
  const db = getFinalEvalDb();
  const ratingsSnap = await db.collection("finalEvalRatings").get();
  const publishedIds = new Set(await getPublishedGameIds());

  const byGame = new Map<
    string,
    {
      historia: number[];
      grafica: number[];
      mecanica: number[];
      general: number[];
    }
  >();

  for (const id of publishedIds) {
    byGame.set(id, { historia: [], grafica: [], mecanica: [], general: [] });
  }

  const voterEmails = new Set<string>();

  ratingsSnap.docs.forEach((doc) => {
    const d = doc.data();
    const gameId = String(d.gameId);
    if (!publishedIds.has(gameId)) return;
    voterEmails.add(normalizeFinalEvalEmail(String(d.email)));
    const scores = d.scores as FinalEvalScores;
    const entry = byGame.get(gameId)!;
    entry.historia.push(scores.historia);
    entry.grafica.push(scores.grafica);
    entry.mecanica.push(scores.mecanica);
    entry.general.push(scores.general);
  });

  const avg = (arr: number[]) =>
    arr.length ? Math.round((arr.reduce((a, b) => a + b, 0) / arr.length) * 100) / 100 : 0;

  const rows = [];
  for (const [gameId, scores] of byGame.entries()) {
    const themeSnap = await db.collection("themes").doc(gameId).get();
    const theme = themeSnap.data() || {};
    const count = scores.historia.length;
    const criteriaAvg = {
      historia: avg(scores.historia),
      grafica: avg(scores.grafica),
      mecanica: avg(scores.mecanica),
      general: avg(scores.general),
    };
    rows.push({
      gameId,
      title: displayGameTitle(theme),
      themeTitle: String(theme.title || ""),
      voteCount: count,
      averages: criteriaAvg,
      overallAverage: averageFinalEvalScores(criteriaAvg),
    });
  }

  rows.sort((a, b) => b.overallAverage - a.overallAverage);

  return {
    totalVotes: ratingsSnap.size,
    uniqueVoters: voterEmails.size,
    gamesRated: rows.filter((r) => r.voteCount > 0).length,
    totalPublishedGames: publishedIds.size,
    rows,
  };
}

export async function getFinalEvalDashboard() {
  const db = getFinalEvalDb();
  const config = await getFinalEvalConfig();
  const allowSnap = await db.collection("finalEvalAllowedEmails").where("enabled", "==", true).get();
  const allowlistCount = allowSnap.size;

  const ratingsSnap = await db.collection("finalEvalRatings").get();
  const voterEmails = new Set<string>();
  ratingsSnap.docs.forEach((doc) => {
    voterEmails.add(normalizeFinalEvalEmail(String(doc.data().email)));
  });

  const publishedIds = await getPublishedGameIds();
  const threshold = config.lowVotesThreshold ?? 3;

  const votesByGame = new Map<string, number>();
  publishedIds.forEach((id) => votesByGame.set(id, 0));
  ratingsSnap.docs.forEach((doc) => {
    const gid = String(doc.data().gameId);
    if (votesByGame.has(gid)) {
      votesByGame.set(gid, (votesByGame.get(gid) || 0) + 1);
    }
  });

  const lowVoteGames = [];
  for (const [gameId, count] of votesByGame.entries()) {
    if (count < threshold) {
      const themeSnap = await db.collection("themes").doc(gameId).get();
      const theme = themeSnap.data() || {};
      lowVoteGames.push({
        gameId,
        title: displayGameTitle(theme),
        voteCount: count,
      });
    }
  }

  const participationPct =
    allowlistCount > 0
      ? Math.round((voterEmails.size / allowlistCount) * 1000) / 10
      : 0;

  const pendingEvaluators = allowSnap.docs
    .map((d) => normalizeFinalEvalEmail(String(d.data().email)))
    .filter((email) => !voterEmails.has(email));

  return {
    allowlistCount,
    votersCount: voterEmails.size,
    participationPct,
    totalVotes: ratingsSnap.size,
    publishedGamesCount: publishedIds.length,
    lowVotesThreshold: threshold,
    lowVoteGames,
    pendingEvaluators,
  };
}
