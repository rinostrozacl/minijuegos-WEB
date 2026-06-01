import type { Timestamp } from "firebase-admin/firestore";

export type PeerEvalStatus =
  | "borrador"
  | "generada"
  | "activa"
  | "pausada"
  | "finalizada";

export interface PeerEvalScores {
  jugabilidad: number;
  funcionamiento: number;
  claridad: number;
  implementacion: number;
}

export interface PeerEvaluationDoc {
  name: string;
  status: PeerEvalStatus;
  gameIds: string[];
  gamesPerEvaluator: number;
  isIntakeEnabled: boolean;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
  createdBy: string;
  generatedAt?: Timestamp | Date;
  finalizedAt?: Timestamp | Date;
  assignmentSeed?: string;
}

export interface PeerEvalAssignmentDoc {
  userId: string;
  assignedGameIds: string[];
  completedGameIds: string[];
}

export interface PeerEvalSubmissionDoc {
  evaluatorUid: string;
  gameId: string;
  scores: PeerEvalScores;
  likedMost: string;
  likedLeast: string;
  averageScore: number;
  submittedAt: Timestamp | Date;
}

export const PEER_EVAL_CRITERIA = [
  {
    key: "jugabilidad" as const,
    label: "Jugabilidad",
    description: "¿Es entretenido?",
  },
  {
    key: "funcionamiento" as const,
    label: "Funcionamiento",
    description: "¿Tiene errores?",
  },
  {
    key: "claridad" as const,
    label: "Claridad",
    description: "¿Se entiende qué hacer?",
  },
  {
    key: "implementacion" as const,
    label: "Implementación",
    description: "Mecánicas bien ejecutadas",
  },
] as const;

export function averagePeerScores(scores: PeerEvalScores): number {
  const values = [
    scores.jugabilidad,
    scores.funcionamiento,
    scores.claridad,
    scores.implementacion,
  ];
  const sum = values.reduce((a, b) => a + b, 0);
  return Math.round((sum / values.length) * 100) / 100;
}

export function validatePeerScores(scores: Partial<PeerEvalScores>): scores is PeerEvalScores {
  const keys: (keyof PeerEvalScores)[] = [
    "jugabilidad",
    "funcionamiento",
    "claridad",
    "implementacion",
  ];
  for (const key of keys) {
    const v = scores[key];
    if (typeof v !== "number" || v < 1 || v > 7 || !Number.isInteger(v)) {
      return false;
    }
  }
  return true;
}
