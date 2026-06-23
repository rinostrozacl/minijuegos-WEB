import { normalizeFirebasePrivateKey } from "./normalizeFirebasePrivateKey";

export type FirebaseCredentialSource =
  | "runtimeConfig"
  | "NUXT_FIREBASE_*"
  | "FIREBASE_*"
  | "none";

export interface FirebaseAdminCredentials {
  projectId: string;
  clientEmail: string;
  privateKey: string;
  source: FirebaseCredentialSource;
}

function pickNonEmpty(...values: Array<string | undefined>): string {
  for (const value of values) {
    const trimmed = value?.trim();
    if (trimmed) return trimmed;
  }
  return "";
}

/** Resuelve credenciales Admin en runtime (build congelado + env Coolify). */
export function resolveFirebaseAdminCredentials(): FirebaseAdminCredentials {
  const config = useRuntimeConfig();
  const fromRuntimeConfig = {
    projectId: config.firebase?.projectId?.trim() || "",
    clientEmail: config.firebase?.clientEmail?.trim() || "",
    privateKey: config.firebase?.privateKey?.trim() || "",
  };

  if (
    fromRuntimeConfig.projectId &&
    fromRuntimeConfig.clientEmail &&
    fromRuntimeConfig.privateKey
  ) {
    return {
      ...fromRuntimeConfig,
      privateKey: normalizeFirebasePrivateKey(fromRuntimeConfig.privateKey),
      source: "runtimeConfig",
    };
  }

  const fromNuxtEnv = {
    projectId: pickNonEmpty(process.env.NUXT_FIREBASE_PROJECT_ID),
    clientEmail: pickNonEmpty(process.env.NUXT_FIREBASE_CLIENT_EMAIL),
    privateKey: pickNonEmpty(process.env.NUXT_FIREBASE_PRIVATE_KEY),
  };

  if (fromNuxtEnv.projectId && fromNuxtEnv.clientEmail && fromNuxtEnv.privateKey) {
    return {
      ...fromNuxtEnv,
      privateKey: normalizeFirebasePrivateKey(fromNuxtEnv.privateKey),
      source: "NUXT_FIREBASE_*",
    };
  }

  const fromFirebaseEnv = {
    projectId: pickNonEmpty(process.env.FIREBASE_PROJECT_ID),
    clientEmail: pickNonEmpty(process.env.FIREBASE_CLIENT_EMAIL),
    privateKey: pickNonEmpty(process.env.FIREBASE_PRIVATE_KEY),
  };

  if (
    fromFirebaseEnv.projectId &&
    fromFirebaseEnv.clientEmail &&
    fromFirebaseEnv.privateKey
  ) {
    return {
      ...fromFirebaseEnv,
      privateKey: normalizeFirebasePrivateKey(fromFirebaseEnv.privateKey),
      source: "FIREBASE_*",
    };
  }

  return {
    projectId: "",
    clientEmail: "",
    privateKey: "",
    source: "none",
  };
}

export function hasFirebaseAdminCredentials(
  creds: FirebaseAdminCredentials
): boolean {
  return !!(creds.projectId && creds.clientEmail && creds.privateKey);
}
