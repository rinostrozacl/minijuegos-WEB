const PEM_BEGIN = "-----BEGIN PRIVATE KEY-----";
const PEM_END = "-----END PRIVATE KEY-----";

/** Normaliza FIREBASE_PRIVATE_KEY desde env (Coolify, Docker, comillas, \\n). */
export function normalizeFirebasePrivateKey(raw: string): string {
  let key = raw.trim();

  if (
    (key.startsWith('"') && key.endsWith('"')) ||
    (key.startsWith("'") && key.endsWith("'"))
  ) {
    key = key.slice(1, -1).trim();
  }

  // Coolify/Docker: varios niveles de escape
  key = key.replace(/\\\\n/g, "\n").replace(/\\n/g, "\n");
  key = key.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  // Una sola línea con marcadores PEM
  if (!key.includes("\n") && key.includes(PEM_BEGIN)) {
    key = key
      .replace(PEM_BEGIN, `${PEM_BEGIN}\n`)
      .replace(PEM_END, `\n${PEM_END}`);
  }

  key = key.trim();
  if (!key.endsWith("\n")) {
    key += "\n";
  }

  return key;
}

export function isValidFirebasePrivateKeyPem(key: string): boolean {
  const normalized = normalizeFirebasePrivateKey(key);
  if (!normalized.includes(PEM_BEGIN) || !normalized.includes(PEM_END)) {
    return false;
  }

  const body = normalized
    .replace(PEM_BEGIN, "")
    .replace(PEM_END, "")
    .replace(/\s/g, "");

  // Clave RSA típica del service account: > 1000 chars en base64
  return body.length > 200;
}

export function privateKeyPemErrorMessage(): string {
  return (
    "FIREBASE_PRIVATE_KEY tiene formato PEM inválido en Coolify. " +
    "Copia solo el campo private_key del JSON de Firebase (sin comillas extra). " +
    "En una línea usa \\n donde van los saltos: " +
    "-----BEGIN PRIVATE KEY-----\\nMIIE...\\n-----END PRIVATE KEY-----\\n"
  );
}
