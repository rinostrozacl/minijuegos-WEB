import {
  readBearerTokenFromRequest,
  verifyFirebaseIdToken,
} from "./firebaseAuth";

type AuthEvent = {
  node: { req: { headers: Record<string, string | string[] | undefined> } };
};

export function isStaffDocenteEmail(email: string | undefined | null): boolean {
  if (!email) return false;
  const lower = email.toLowerCase();
  return (
    lower.endsWith("@santotomas.cl") && !lower.includes("@alumnos.santotomas.cl")
  );
}

export async function verifyIdTokenFromRequest(
  event: AuthEvent
): Promise<{ uid: string; email?: string }> {
  const idToken = readBearerTokenFromRequest(event);
  const decoded = await verifyFirebaseIdToken(idToken);
  return { uid: decoded.uid, email: decoded.email };
}

export async function assertAdminFromRequest(
  event: AuthEvent
): Promise<{ uid: string; email: string }> {
  const user = await verifyIdTokenFromRequest(event);
  if (!isStaffDocenteEmail(user.email)) {
    throw createError({
      statusCode: 403,
      statusMessage: "Se requieren permisos de administrador",
    });
  }
  return { uid: user.uid, email: user.email! };
}
