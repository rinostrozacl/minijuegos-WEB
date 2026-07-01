import type { FinalEvalStatus } from "~/utils/finalEval";

export function useFinalEvalAdmin() {
  const toast = useToast();

  async function authHeaders(): Promise<Record<string, string>> {
    const { getFreshIdToken } = useAuth();
    const token = await getFreshIdToken();
    return { Authorization: `Bearer ${token}` };
  }

  async function fetchConfig() {
    const headers = await authHeaders();
    return await $fetch<{
      status: FinalEvalStatus;
      introText: string;
      lowVotesThreshold: number;
      allowlistCount: number;
    }>("/api/final-eval/admin/config", { headers });
  }

  async function setStatus(payload: {
    status: FinalEvalStatus;
    introText?: string;
    lowVotesThreshold?: number;
  }) {
    const headers = await authHeaders();
    return await $fetch("/api/final-eval/admin/set-status", {
      method: "POST",
      headers,
      body: payload,
    });
  }

  async function fetchDashboard() {
    const headers = await authHeaders();
    return await $fetch<{
      allowlistCount: number;
      votersCount: number;
      participationPct: number;
      totalVotes: number;
      publishedGamesCount: number;
      lowVotesThreshold: number;
      lowVoteGames: { gameId: string; title: string; voteCount: number }[];
      pendingEvaluators: string[];
    }>("/api/final-eval/admin/dashboard", { headers });
  }

  async function fetchAllowedEmails() {
    const headers = await authHeaders();
    return await $fetch<{
      emails: { id: string; email: string; enabled: boolean; ratingCount: number }[];
    }>("/api/final-eval/admin/allowed-emails", { headers });
  }

  async function addEmail(email: string) {
    const headers = await authHeaders();
    return await $fetch("/api/final-eval/admin/allowed-emails", {
      method: "POST",
      headers,
      body: { email },
    });
  }

  async function bulkImport(text: string) {
    const headers = await authHeaders();
    return await $fetch<{
      added: string[];
      invalid: string[];
      duplicates: string[];
    }>("/api/final-eval/admin/allowed-emails/bulk", {
      method: "POST",
      headers,
      body: { text },
    });
  }

  async function removeEmail(id: string) {
    const headers = await authHeaders();
    return await $fetch(`/api/final-eval/admin/allowed-emails?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers,
    });
  }

  async function fetchResults() {
    const headers = await authHeaders();
    return await $fetch<{
      status: FinalEvalStatus;
      introText: string;
      summary: {
        totalVotes: number;
        uniqueVoters: number;
        gamesRated: number;
        totalPublishedGames: number;
      };
      rows: {
        gameId: string;
        title: string;
        themeTitle: string;
        voteCount: number;
        averages: {
          historia: number;
          grafica: number;
          mecanica: number;
          general: number;
        };
        overallAverage: number;
      }[];
    }>("/api/final-eval/admin/results", { headers });
  }

  function showError(e: unknown, fallback: string) {
    const err = e as { data?: { statusMessage?: string }; statusMessage?: string };
    toast.add({
      title: "Error",
      description: err?.data?.statusMessage || err?.statusMessage || fallback,
      color: "red",
    });
  }

  return {
    fetchConfig,
    setStatus,
    fetchDashboard,
    fetchAllowedEmails,
    addEmail,
    bulkImport,
    removeEmail,
    fetchResults,
    showError,
  };
}
