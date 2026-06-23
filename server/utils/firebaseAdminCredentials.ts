import fs from "node:fs";
import { createPrivateKey } from "node:crypto";
import {
  isValidFirebasePrivateKeyPem,
  normalizeFirebasePrivateKey,
} from "./normalizeFirebasePrivateKey";

export type FirebaseCredentialSource =
  | "FIREBASE_SERVICE_ACCOUNT_JSON_BASE64"
  | "FIREBASE_SERVICE_ACCOUNT_JSON"
  | "service_account_file"
  | "FIREBASE_*"
  | "NUXT_FIREBASE_*"
  | "runtimeConfig"
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

function parseServiceAccountJson(
  raw: string,
  source: FirebaseCredentialSource = "FIREBASE_SERVICE_ACCOUNT_JSON"
): FirebaseAdminCredentials | null {
  const trimmed = raw.trim();
  if (!trimmed.startsWith("{")) return null;

  try {
    const sa = JSON.parse(trimmed) as Record<string, unknown>;
    return fromServiceAccountObject(sa, source);
  } catch {
    return null;
  }
}

function parseServiceAccountBase64(raw: string): FirebaseAdminCredentials | null {
  try {
    const json = Buffer.from(raw.trim(), "base64").toString("utf8");
    return parseServiceAccountJson(json, "FIREBASE_SERVICE_ACCOUNT_JSON_BASE64");
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

function fromEnvTriple(
  projectId: string,
  clientEmail: string,
  privateKey: string,
  source: "FIREBASE_*" | "NUXT_FIREBASE_*"
): FirebaseAdminCredentials | null {
  if (!projectId || !clientEmail || !privateKey) return null;
  return {
    projectId,
    clientEmail,
    privateKey: normalizeFirebasePrivateKey(privateKey),
    source,
  };
}

/**
 * Runtime primero (Coolify). runtimeConfig del build va al final: suele traer claves corruptas.
 */
export function resolveFirebaseAdminCredentials(): FirebaseAdminCredentials {
  const base64Raw = pickNonEmpty(
    process.env.FIREBASE_SERVICE_ACCOUNT_JSON_BASE64,
    process.env.NUXT_FIREBASE_SERVICE_ACCOUNT_JSON_BASE64
  );
  if (base64Raw) {
    const fromBase64 = parseServiceAccountBase64(base64Raw);
    if (fromBase64) return fromBase64;
  }

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

  const fromFirebaseEnv = fromEnvTriple(
    pickNonEmpty(process.env.FIREBASE_PROJECT_ID),
    pickNonEmpty(process.env.FIREBASE_CLIENT_EMAIL),
    pickNonEmpty(process.env.FIREBASE_PRIVATE_KEY),
    "FIREBASE_*"
  );
  if (fromFirebaseEnv) return fromFirebaseEnv;

  const fromNuxtEnv = fromEnvTriple(
    pickNonEmpty(process.env.NUXT_FIREBASE_PROJECT_ID),
    pickNonEmpty(process.env.NUXT_FIREBASE_CLIENT_EMAIL),
    pickNonEmpty(process.env.NUXT_FIREBASE_PRIVATE_KEY),
    "NUXT_FIREBASE_*"
  );
  if (fromNuxtEnv) return fromNuxtEnv;

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

/** Comprueba que OpenSSL puede leer la clave (no solo que tenga BEGIN/END). */
export function privateKeyCryptoValid(privateKey: string): boolean {
  try {
    createPrivateKey(privateKey);
    return true;
  } catch {
    return false;
  }
}

export function credentialsPrivateKeyLooksValid(
  creds: FirebaseAdminCredentials
): boolean {
  const key =
    creds.source === "FIREBASE_SERVICE_ACCOUNT_JSON" ||
    creds.source === "FIREBASE_SERVICE_ACCOUNT_JSON_BASE64" ||
    creds.source === "service_account_file"
      ? creds.privateKey
      : normalizeFirebasePrivateKey(creds.privateKey);

  return isValidFirebasePrivateKeyPem(key) && privateKeyCryptoValid(key);
}

export function firebaseCredentialConfigHint(): string {
  return (
    "En Coolify usa FIREBASE_SERVICE_ACCOUNT_JSON_BASE64: en tu Mac ejecuta " +
    "`base64 -i tu-archivo-firebase.json | tr -d '\\n'` y pega el resultado. " +
    "Elimina FIREBASE_PRIVATE_KEY y redeploy."
  );
}

export function getFirebaseCredentialDiagnostics() {
  const creds = resolveFirebaseAdminCredentials();
  const rawKey = process.env.FIREBASE_PRIVATE_KEY || "";
  return {
    credentialSource: creds.source,
    credentialsPresent: hasFirebaseAdminCredentials(creds),
    privateKeyLength: creds.privateKey.length,
    privateKeyHasBegin: creds.privateKey.includes("BEGIN PRIVATE KEY"),
    privateKeyHasEnd: creds.privateKey.includes("END PRIVATE KEY"),
    privateKeyCryptoValid: creds.privateKey
      ? privateKeyCryptoValid(
          creds.source === "FIREBASE_*" || creds.source === "NUXT_FIREBASE_*"
            ? normalizeFirebasePrivateKey(creds.privateKey)
            : creds.privateKey
        )
      : false,
    envFlags: {
      hasServiceAccountJsonBase64: !!pickNonEmpty(
        process.env.FIREBASE_SERVICE_ACCOUNT_JSON_BASE64,
        process.env.NUXT_FIREBASE_SERVICE_ACCOUNT_JSON_BASE64
      ),
      hasServiceAccountJson: !!pickNonEmpty(
        process.env.FIREBASE_SERVICE_ACCOUNT_JSON,
        process.env.NUXT_FIREBASE_SERVICE_ACCOUNT_JSON
      ),
      hasFirebasePrivateKey: !!rawKey.trim(),
      rawPrivateKeyLength: rawKey.length,
    },
  };
}
