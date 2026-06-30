import { createHash } from "node:crypto";
import { getFirestoreDb } from "../plugins/firebase-admin";

const EMAIL_MAX_REQUESTS = 3;
const EMAIL_WINDOW_MS = 15 * 60 * 1000;
const IP_MAX_REQUESTS = 10;
const IP_WINDOW_MS = 60 * 60 * 1000;

function hashIp(ip: string): string {
  return createHash("sha256").update(ip).digest("hex").slice(0, 32);
}

function windowCount(
  windowStart: unknown,
  requestCount: number,
  windowMs: number
): number {
  const start =
    windowStart && typeof (windowStart as { toDate?: () => Date }).toDate === "function"
      ? (windowStart as { toDate: () => Date }).toDate()
      : windowStart instanceof Date
        ? windowStart
        : null;
  if (!start) return 0;
  if (Date.now() - start.getTime() > windowMs) return 0;
  return requestCount;
}

export async function checkRegistrationEmailRateLimit(
  email: string,
  ip: string
): Promise<void> {
  const db = getFirestoreDb();
  const now = Date.now();
  const normalized = email.toLowerCase().trim();

  const emailSnap = await db.collection("verificationEmailRateLimit").doc(normalized).get();
  if (emailSnap.exists) {
    const d = emailSnap.data()!;
    const count = windowCount(d.windowStart, Number(d.requestCount || 0), EMAIL_WINDOW_MS);
    if (count >= EMAIL_MAX_REQUESTS) {
      throw createError({
        statusCode: 429,
        statusMessage: "Demasiadas solicitudes. Intenta más tarde.",
      });
    }
  }

  const ipRef = db.collection("verificationEmailRateLimitByIp").doc(hashIp(ip));
  const ipSnap = await ipRef.get();
  if (ipSnap.exists) {
    const d = ipSnap.data()!;
    const count = windowCount(d.windowStart, Number(d.requestCount || 0), IP_WINDOW_MS);
    if (count >= IP_MAX_REQUESTS) {
      throw createError({
        statusCode: 429,
        statusMessage: "Demasiadas solicitudes desde esta red. Intenta más tarde.",
      });
    }
  }
}

export async function recordRegistrationEmailRequest(
  email: string,
  ip: string
): Promise<void> {
  const db = getFirestoreDb();
  const now = new Date();
  const normalized = email.toLowerCase().trim();

  const emailRef = db.collection("verificationEmailRateLimit").doc(normalized);
  const emailSnap = await emailRef.get();
  let emailCount = 1;
  let emailWindowStart = now;
  if (emailSnap.exists) {
    const d = emailSnap.data()!;
    const prev = windowCount(d.windowStart, Number(d.requestCount || 0), EMAIL_WINDOW_MS);
    if (prev > 0) {
      emailCount = prev + 1;
      const ws = d.windowStart?.toDate?.() || d.windowStart;
      emailWindowStart = ws instanceof Date ? ws : now;
    }
  }
  await emailRef.set({
    requestCount: emailCount,
    windowStart: emailWindowStart,
    lastRequestAt: now,
  });

  const ipRef = db.collection("verificationEmailRateLimitByIp").doc(hashIp(ip));
  const ipSnap = await ipRef.get();
  let ipCount = 1;
  let ipWindowStart = now;
  if (ipSnap.exists) {
    const d = ipSnap.data()!;
    const prev = windowCount(d.windowStart, Number(d.requestCount || 0), IP_WINDOW_MS);
    if (prev > 0) {
      ipCount = prev + 1;
      const ws = d.windowStart?.toDate?.() || d.windowStart;
      ipWindowStart = ws instanceof Date ? ws : now;
    }
  }
  await ipRef.set({
    requestCount: ipCount,
    windowStart: ipWindowStart,
    lastRequestAt: now,
  });
}
