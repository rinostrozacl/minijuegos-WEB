import type { PeerEvalScores } from "~/utils/peerEval";

export function usePeerEvaluations() {
  const { $auth } = useNuxtApp();
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  async function getIdTokenOrThrow(): Promise<string> {
    const auth = $auth as { currentUser: { getIdToken: () => Promise<string> } | null };
    if (!auth?.currentUser) {
      throw new Error("Debes iniciar sesión");
    }
    return auth.currentUser.getIdToken();
  }

  async function apiFetch<T>(
    url: string,
    options: { method?: string; body?: unknown; query?: Record<string, string> } = {}
  ): Promise<T> {
    isLoading.value = true;
    error.value = null;
    try {
      const token = await getIdTokenOrThrow();
      return await $fetch<T>(url, {
        method: (options.method || "GET") as "GET" | "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: options.body,
        query: options.query,
      });
    } catch (e: unknown) {
      const msg =
        (e as { data?: { statusMessage?: string }; message?: string })?.data
          ?.statusMessage ||
        (e as Error)?.message ||
        "Error en la solicitud";
      error.value = msg;
      throw e;
    } finally {
      isLoading.value = false;
    }
  }

  const listEvaluations = () =>
    apiFetch<{ evaluations: PeerEvalListItem[] }>("/api/peer-eval/list");

  const listReservedGames = () =>
    apiFetch<{ games: ReservedGameItem[] }>("/api/peer-eval/reserved-games");

  const createEvaluation = (payload: {
    name: string;
    gamesPerEvaluator: number;
    gameIds: string[];
  }) =>
    apiFetch<{ success: boolean; evalId: string }>("/api/peer-eval/create", {
      method: "POST",
      body: payload,
    });

  const updateEvaluation = (payload: {
    evalId: string;
    name?: string;
    gamesPerEvaluator?: number;
    gameIds?: string[];
  }) => apiFetch("/api/peer-eval/update", { method: "POST", body: payload });

  const generateEvaluation = (evalId: string) =>
    apiFetch("/api/peer-eval/generate", { method: "POST", body: { evalId } });

  const startEvaluation = (evalId: string) =>
    apiFetch("/api/peer-eval/start", { method: "POST", body: { evalId } });

  const setIntake = (evalId: string, enabled: boolean) =>
    apiFetch("/api/peer-eval/set-intake", {
      method: "POST",
      body: { evalId, enabled },
    });

  const finalizeEvaluation = (evalId: string) =>
    apiFetch("/api/peer-eval/finalize", { method: "POST", body: { evalId } });

  const resetEvaluation = (evalId: string) =>
    apiFetch("/api/peer-eval/reset", { method: "POST", body: { evalId } });

  const cancelEvaluation = (evalId: string) =>
    apiFetch("/api/peer-eval/cancel", {
      method: "POST",
      body: { evalId, confirm: true },
    });

  const getReport = (evalId: string, sort = "score_desc") =>
    apiFetch<PeerEvalReport>("/api/peer-eval/report", {
      query: { evalId, sort },
    });

  const getMyEvaluations = () =>
    apiFetch<{ evaluations: MyEvalListItem[] }>("/api/peer-eval/my-assignments");

  const getMyEvaluationDetail = (evalId: string) =>
    apiFetch<MyEvalDetail>("/api/peer-eval/my-assignments", { query: { evalId } });

  const submitEvaluation = (payload: {
    evalId: string;
    gameId: string;
    scores: PeerEvalScores;
    likedMost: string;
    likedLeast: string;
  }) => apiFetch("/api/peer-eval/submit", { method: "POST", body: payload });

  return {
    isLoading,
    error,
    listEvaluations,
    listReservedGames,
    createEvaluation,
    updateEvaluation,
    generateEvaluation,
    startEvaluation,
    setIntake,
    finalizeEvaluation,
    resetEvaluation,
    cancelEvaluation,
    getReport,
    getMyEvaluations,
    getMyEvaluationDetail,
    submitEvaluation,
  };
}

export interface PeerEvalListItem {
  id: string;
  name: string;
  status: string;
  gameIds: string[];
  gamesPerEvaluator: number;
  isIntakeEnabled: boolean;
  gameCount: number;
  evaluatorCount: number;
  completedEvaluators: number;
  progressPercent: number;
}

export interface ReservedGameItem {
  id: string;
  numero: number | string;
  title: string;
  responsables: string;
}

export interface MyEvalListItem {
  id: string;
  name: string;
  progress: { completed: number; total: number };
}

export interface MyEvalDetail {
  evaluation: {
    id: string;
    name: string;
    status: string;
    isIntakeEnabled: boolean;
    gamesPerEvaluator: number;
  };
  assignment: {
    assignedGameIds: string[];
    completedGameIds: string[];
  };
  games: Array<{
    id: string;
    numero: number | string;
    title: string;
    reservedBy: string;
    teammateName: string;
  }>;
  submissions: Array<{
    id: string;
    gameId: string;
    scores: PeerEvalScores;
    likedMost: string;
    likedLeast: string;
    averageScore: number;
  }>;
}

export interface PeerEvalReport {
  evaluation: {
    id: string;
    name: string;
    status: string;
    gamesPerEvaluator: number;
  };
  summary: {
    totalEvaluators: number;
    completedEvaluators: number;
    totalSubmissions: number;
  };
  rows: Array<{
    gameId: string;
    numero: number | string;
    title: string;
    responsables: string;
    evaluationCount: number;
    finalAverage: number;
    criteriaAvg: PeerEvalScores;
  }>;
}
