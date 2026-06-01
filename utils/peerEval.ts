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

export const PEER_EVAL_STATUS_LABELS: Record<PeerEvalStatus, string> = {
  borrador: "Borrador",
  generada: "Generada",
  activa: "Activa",
  pausada: "Pausada",
  finalizada: "Finalizada",
};

export function peerEvalStatusColor(
  status: PeerEvalStatus
): "gray" | "blue" | "green" | "amber" | "purple" {
  switch (status) {
    case "borrador":
      return "gray";
    case "generada":
      return "blue";
    case "activa":
      return "green";
    case "pausada":
      return "amber";
    case "finalizada":
      return "purple";
    default:
      return "gray";
  }
}

export function averagePeerScores(scores: PeerEvalScores): number {
  const values = [
    scores.jugabilidad,
    scores.funcionamiento,
    scores.claridad,
    scores.implementacion,
  ];
  return Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 100) / 100;
}
