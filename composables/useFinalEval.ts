import { FINAL_EVAL_SESSION_KEY, type FinalEvalStatus } from "~/utils/finalEval";

export type { FinalEvalStatus };

export interface FinalEvalScores {
  historia: number;
  grafica: number;
  mecanica: number;
  general: number;
}

export function useFinalEval() {
  const status = ref<FinalEvalStatus>("cerrada");
  const isLoadingStatus = ref(false);
  const skipOtp = ref(false);
  const evaluatorEmail = ref("");
  const sessionId = ref("");
  const isSubmitting = ref(false);

  const { getFreshIdToken, user, isAuthenticated } = useAuth();

  const isEvalOpen = computed(() => status.value === "abierta");

  function loadSessionFromStorage() {
    if (import.meta.client) {
      sessionId.value =
        sessionStorage.getItem(FINAL_EVAL_SESSION_KEY) || "";
    }
  }

  function saveSession(id: string) {
    sessionId.value = id;
    if (import.meta.client) {
      sessionStorage.setItem(FINAL_EVAL_SESSION_KEY, id);
    }
  }

  function authHeaders(): Record<string, string> {
    const headers: Record<string, string> = {};
    if (sessionId.value) {
      headers["X-Final-Eval-Session"] = sessionId.value;
    }
    return headers;
  }

  async function fetchStatus() {
    isLoadingStatus.value = true;
    try {
      const data = await $fetch<{ status: FinalEvalStatus }>("/api/final-eval/status");
      status.value = data.status;
    } catch {
      status.value = "cerrada";
    } finally {
      isLoadingStatus.value = false;
    }
  }

  async function fetchEligibility() {
    loadSessionFromStorage();
    try {
      let headers: Record<string, string> = { ...authHeaders() };
      if (isAuthenticated.value) {
        const token = await getFreshIdToken();
        headers.Authorization = `Bearer ${token}`;
      }
      const data = await $fetch<{
        status: FinalEvalStatus;
        canEvaluate?: boolean;
        skipOtp?: boolean;
        email?: string;
      }>("/api/final-eval/eligibility", { headers });
      status.value = data.status;
      skipOtp.value = !!data.skipOtp;
      if (data.email) evaluatorEmail.value = data.email;
      return data;
    } catch {
      return null;
    }
  }

  async function startSession(email: string) {
    const res = await $fetch<{
      success: boolean;
      sessionId: string;
      email: string;
      expiresAt: string;
    }>("/api/final-eval/start-session", {
      method: "POST",
      body: { email: email.trim().toLowerCase() },
    });
    saveSession(res.sessionId);
    evaluatorEmail.value = res.email;
    return res;
  }

  async function buildAuthHeaders(): Promise<Record<string, string>> {
    const headers = { ...authHeaders() };
    if (skipOtp.value && isAuthenticated.value) {
      const token = await getFreshIdToken();
      headers.Authorization = `Bearer ${token}`;
    } else if (sessionId.value) {
      headers["X-Final-Eval-Session"] = sessionId.value;
    } else if (isAuthenticated.value) {
      const token = await getFreshIdToken();
      headers.Authorization = `Bearer ${token}`;
    }
    return headers;
  }

  async function checkRated(gameId: string) {
    try {
      const headers = await buildAuthHeaders();
      return await $fetch<{ hasRated: boolean; email?: string }>(
        `/api/final-eval/check?gameId=${encodeURIComponent(gameId)}`,
        { headers }
      );
    } catch {
      return { hasRated: false };
    }
  }

  async function submitRating(gameId: string, scores: FinalEvalScores) {
    isSubmitting.value = true;
    try {
      const headers = await buildAuthHeaders();
      await $fetch("/api/final-eval/submit", {
        method: "POST",
        headers,
        body: { gameId, scores },
      });
      return true;
    } finally {
      isSubmitting.value = false;
    }
  }

  async function fetchProgress() {
    try {
      const headers = await buildAuthHeaders();
      return await $fetch<{
        totalPublished: number;
        ratedCount: number;
        pendingCount: number;
      }>("/api/final-eval/progress", { headers });
    } catch {
      return null;
    }
  }

  return {
    status,
    isEvalOpen,
    isLoadingStatus,
    skipOtp,
    evaluatorEmail,
    sessionId,
    isSubmitting,
    user,
    isAuthenticated,
    fetchStatus,
    fetchEligibility,
    startSession,
    checkRated,
    submitRating,
    fetchProgress,
    loadSessionFromStorage,
  };
}
