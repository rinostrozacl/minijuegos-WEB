import type { Timestamp } from "firebase-admin/firestore";

export type FinalEvalStatus = "cerrada" | "abierta" | "finalizada";

export interface FinalEvalScores {
  historia: number;
  grafica: number;
  mecanica: number;
  general: number;
}

export interface FinalEvalConfigDoc {
  status: FinalEvalStatus;
  introText?: string;
  lowVotesThreshold?: number;
  updatedAt: Timestamp | Date;
  updatedBy?: string;
}

export interface FinalEvalAllowedEmailDoc {
  email: string;
  enabled: boolean;
  createdAt: Timestamp | Date;
  createdBy?: string;
}

export interface FinalEvalSessionDoc {
  email: string;
  expiresAt: Timestamp | Date;
  createdAt: Timestamp | Date;
}

export interface FinalEvalRatingDoc {
  email: string;
  gameId: string;
  scores: FinalEvalScores;
  submittedAt: Timestamp | Date;
  evaluatorUid?: string;
}

export const FINAL_EVAL_CRITERIA = [
  { key: "historia" as const, label: "Historia" },
  { key: "grafica" as const, label: "Gráfica" },
  { key: "mecanica" as const, label: "Mecánica" },
  { key: "general" as const, label: "General" },
] as const;

export const FINAL_EVAL_STATUS_LABELS: Record<FinalEvalStatus, string> = {
  cerrada: "Cerrada",
  abierta: "Abierta",
  finalizada: "Finalizada",
};

export function validateFinalEvalScores(
  scores: Partial<FinalEvalScores>
): scores is FinalEvalScores {
  const keys: (keyof FinalEvalScores)[] = [
    "historia",
    "grafica",
    "mecanica",
    "general",
  ];
  for (const key of keys) {
    const v = scores[key];
    if (typeof v !== "number" || v < 1 || v > 5 || !Number.isInteger(v)) {
      return false;
    }
  }
  return true;
}

export function averageFinalEvalScores(scores: FinalEvalScores): number {
  const values = [scores.historia, scores.grafica, scores.mecanica, scores.general];
  const sum = values.reduce((a, b) => a + b, 0);
  return Math.round((sum / values.length) * 100) / 100;
}

export function emailToDocId(email: string): string {
  return email.toLowerCase().trim().replace(/[@.]/g, "_");
}

export function normalizeFinalEvalEmail(raw: string): string {
  return raw.toLowerCase().trim();
}

export function isValidFinalEvalEmailFormat(email: string): boolean {
  const e = normalizeFinalEvalEmail(email);
  if (!e || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) return false;
  return true;
}

export function ratingDocId(email: string, gameId: string): string {
  return `${emailToDocId(email)}__${gameId}`;
}
