import { isAllowedItchInputUrl } from "~/utils/gamePlayUrl";

export interface ItchImportResult {
  success: boolean;
  pageUrl: string;
  playUrl: string;
  gameId: string;
  saved: boolean;
}

export function useItchImport() {
  const isResolving = ref(false);
  const isSaving = ref(false);
  const error = ref<string | null>(null);

  async function getIdTokenOrThrow(): Promise<string> {
    const { $auth } = useNuxtApp();
    if (!$auth?.currentUser) {
      throw new Error("Sesión requerida");
    }
    return $auth.currentUser.getIdToken();
  }

  async function callImportApi(
    themeId: string,
    itchPageUrl: string,
    dryRun: boolean
  ): Promise<ItchImportResult> {
    const token = await getIdTokenOrThrow();

    return await $fetch<ItchImportResult>("/api/games/import-itch", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: {
        themeId,
        itchPageUrl: itchPageUrl.trim(),
        dryRun,
      },
    });
  }

  async function testItchUrl(
    themeId: string,
    itchPageUrl: string
  ): Promise<ItchImportResult> {
    if (!isAllowedItchInputUrl(itchPageUrl)) {
      throw new Error(
        "URL inválida. Usa la página de tu juego en itch.io (https://usuario.itch.io/nombre-juego)."
      );
    }

    isResolving.value = true;
    error.value = null;
    try {
      return await callImportApi(themeId, itchPageUrl, true);
    } catch (err: unknown) {
      const e = err as {
        data?: { statusMessage?: string };
        statusMessage?: string;
        message?: string;
      };
      const msg =
        e?.data?.statusMessage ||
        e?.statusMessage ||
        e?.message ||
        "No se pudo probar el enlace";
      error.value = msg;
      throw new Error(msg);
    } finally {
      isResolving.value = false;
    }
  }

  async function saveItchUrl(
    themeId: string,
    itchPageUrl: string
  ): Promise<ItchImportResult> {
    isSaving.value = true;
    error.value = null;
    try {
      return await callImportApi(themeId, itchPageUrl, false);
    } catch (err: unknown) {
      const e = err as {
        data?: { statusMessage?: string };
        statusMessage?: string;
        message?: string;
      };
      const msg =
        e?.data?.statusMessage ||
        e?.statusMessage ||
        e?.message ||
        "No se pudo guardar el enlace";
      error.value = msg;
      throw new Error(msg);
    } finally {
      isSaving.value = false;
    }
  }

  async function clearItchLink(themeId: string): Promise<void> {
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
    testItchUrl,
    saveItchUrl,
    clearItchLink,
  };
}
