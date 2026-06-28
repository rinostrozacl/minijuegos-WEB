export type FinalEvalStatus = "cerrada" | "abierta" | "finalizada";

export const FINAL_EVAL_STATUS_LABELS: Record<FinalEvalStatus, string> = {
  cerrada: "Cerrada",
  abierta: "Abierta",
  finalizada: "Finalizada",
};

export function finalEvalStatusColor(
  status: FinalEvalStatus
): "gray" | "green" | "blue" {
  if (status === "abierta") return "green";
  if (status === "finalizada") return "blue";
  return "gray";
}

export const FINAL_EVAL_CRITERIA = [
  { key: "historia", label: "Historia" },
  { key: "grafica", label: "Gráfica" },
  { key: "mecanica", label: "Mecánica" },
  { key: "general", label: "General" },
] as const;

export const FINAL_EVAL_SESSION_KEY = "finalEvalSessionId";
