import { isAllowedGithubPagesPlayUrl, normalizeGithubPagesPlayUrl } from "~/utils/gamePlayUrl";

export interface GithubPagesImportResult {
  success: boolean;
  playUrl: string;
  canvasWidth?: number;
  canvasHeight?: number;
  frameExtraHeight?: number;
  saved: boolean;
}

export function useGithubPagesImport() {
  const isResolving = ref(false);
  const isSaving = ref(false);
  const error = ref<string | null>(null);

  const { getFreshIdToken } = useAuth();

  async function getIdTokenOrThrow(): Promise<string> {
    return getFreshIdToken();
  }

  async function callImportApi(
    themeId: string,
    playUrl: string,
    dryRun: boolean
  ): Promise<GithubPagesImportResult> {
    const token = await getIdTokenOrThrow();
    const normalized = normalizeGithubPagesPlayUrl(playUrl);
    if (!normalized) {
      throw new Error(
        "URL inválida. Usa GitHub Pages (https://usuario.github.io/repositorio/)."
      );
    }

    return await $fetch<GithubPagesImportResult>(
      "/api/games/import-github-pages",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: {
          themeId,
          playUrl: normalized,
          dryRun,
        },
      }
    );
  }

  function extractError(err: unknown): string {
    const e = err as {
      data?: { statusMessage?: string; message?: string };
      statusMessage?: string;
      message?: string;
    };
    return (
      e?.data?.statusMessage ||
      e?.data?.message ||
      e?.statusMessage ||
      e?.message ||
      "Error en la operación"
    );
  }

  async function testPlayUrl(
    themeId: string,
    playUrl: string
  ): Promise<GithubPagesImportResult> {
    if (!isAllowedGithubPagesPlayUrl(playUrl)) {
      throw new Error(
        "URL inválida. Usa GitHub Pages (https://usuario.github.io/repositorio/)."
      );
    }

    isResolving.value = true;
    error.value = null;
    try {
      return await callImportApi(themeId, playUrl, true);
    } catch (err: unknown) {
      const msg = extractError(err);
      error.value = msg;
      throw new Error(msg);
    } finally {
      isResolving.value = false;
    }
  }

  async function savePlayUrl(
    themeId: string,
    playUrl: string
  ): Promise<GithubPagesImportResult> {
    isSaving.value = true;
    error.value = null;
    try {
      return await callImportApi(themeId, playUrl, false);
    } catch (err: unknown) {
      const msg = extractError(err);
      error.value = msg;
      throw new Error(msg);
    } finally {
      isSaving.value = false;
    }
  }

  async function clearGamePlay(themeId: string): Promise<void> {
    const token = await getIdTokenOrThrow();
    await $fetch("/api/games/clear-itch", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: { themeId },
    });
  }

  return {
    isResolving: readonly(isResolving),
    isSaving: readonly(isSaving),
    error: readonly(error),
    testPlayUrl,
    savePlayUrl,
    clearGamePlay,
  };
}
