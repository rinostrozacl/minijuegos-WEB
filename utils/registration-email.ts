/**
 * Formato de correo aceptado en registro / verificación previa.
 * Institucionales @alumnos.santotomas.cl o @santotomas.cl, más una lista cerrada para pruebas.
 */
export const REGISTRATION_EMAIL_TEST_ALLOWLIST = [
  "rinostrozareb@gmail.com",
] as const;

const INSTITUTIONAL_EMAIL_REGEX =
  /^[a-zA-Z0-9._-]+@(alumnos\.|)santotomas\.cl$/;

export function isRegistrationEmailFormatAllowed(email: string): boolean {
  const e = email.trim().toLowerCase();
  if (!e) return false;
  if ((REGISTRATION_EMAIL_TEST_ALLOWLIST as readonly string[]).includes(e)) {
    return true;
  }
  return INSTITUTIONAL_EMAIL_REGEX.test(e);
}
