import fs from "node:fs";
import {
  isValidFirebasePrivateKeyPem,
  normalizeFirebasePrivateKey,
} from "./normalizeFirebasePrivateKey";

export type FirebaseCredentialSource =
  | "FIREBASE_SERVICE_ACCOUNT_JSON"
  | "service_account_file"
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

function fromServiceAccountObject(
  sa: Record<string, unknown>,
  source: FirebaseCredentialSource
): FirebaseAdminCredentials | null {
  const projectId =
    typeof sa.project_id === "string" ? sa.project_id.trim() : "";
  const clientEmail =
    typeof sa.client_email === "string" ? sa.client_email.trim() : "";
  const privateKey =
    typeof sa.private_key === "string" ? sa.private_key : "";

  if (!projectId || !clientEmail || !privateKey) return null;

  return { projectId, clientEmail, privateKey, source };
}

function parseServiceAccountJson(raw: string): FirebaseAdminCredentials | null {
  const trimmed = raw.trim();
  if (!trimmed.startsWith("{")) return null;

  try {
    const sa = JSON.parse(trimmed) as Record<string, unknown>;
    return fromServiceAccountObject(sa, "FIREBASE_SERVICE_ACCOUNT_JSON");
  } catch {
    return null;
  }
}

function readServiceAccountFile(
  filePath: string
): FirebaseAdminCredentials | null {
  try {
    if (!fs.existsSync(filePath)) return null;
    const sa = JSON.parse(fs.readFileSync(filePath, "utf8")) as Record<
      string,
      unknown
    >;
    return fromServiceAccountObject(sa, "service_account_file");
  } catch {
    return null;
  }
}

/** Resuelve credenciales Admin en runtime (Coolify: preferir JSON completo). */
export function resolveFirebaseAdminCredentials(): FirebaseAdminCredentials {
  const jsonRaw = pickNonEmpty(
    process.env.FIREBASE_SERVICE_ACCOUNT_JSON,
    process.env.NUXT_FIREBASE_SERVICE_ACCOUNT_JSON
  );
  if (jsonRaw) {
    const fromJson = parseServiceAccountJson(jsonRaw);
    if (fromJson) return fromJson;
  }

  const filePath = pickNonEmpty(
    process.env.FIREBASE_SERVICE_ACCOUNT_PATH,
    process.env.GOOGLE_APPLICATION_CREDENTIALS
  );
  if (filePath) {
    const fromFile = readServiceAccountFile(filePath);
    if (fromFile) return fromFile;
  }

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

export function credentialsPrivateKeyLooksValid(
  creds: FirebaseAdminCredentials
): boolean {
  if (creds.source === "FIREBASE_SERVICE_ACCOUNT_JSON" || creds.source === "service_account_file") {
    return isValidFirebasePrivateKeyPem(creds.privateKey);
  }
  return isValidFirebasePrivateKeyPem(normalizeFirebasePrivateKey(creds.privateKey));
}

export function firebaseCredentialConfigHint(): string {
  return (
    "En Coolify crea la variable FIREBASE_SERVICE_ACCOUNT_JSON y pega el JSON completo " +
    "descargado de Firebase (Project settings → Service accounts → Generate new private key). " +
    "Puedes borrar FIREBASE_PRIVATE_KEY si usas el JSON."
  );
}
