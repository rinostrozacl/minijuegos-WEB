import { getAuth } from "firebase-admin/auth";

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
  const raw =
    event.node.req.headers.authorization ||
    event.node.req.headers.Authorization;
  const header = Array.isArray(raw) ? raw[0] : raw;
  if (!header?.startsWith("Bearer ")) {
    throw createError({
      statusCode: 401,
      statusMessage: "Se requiere autenticación",
    });
  }

  const idToken = header.slice(7).trim();
  if (!idToken) {
    throw createError({ statusCode: 401, statusMessage: "Token vacío" });
  }

  try {
    const decoded = await getAuth().verifyIdToken(idToken);
    return { uid: decoded.uid, email: decoded.email };
  } catch {
    throw createError({ statusCode: 401, statusMessage: "Token inválido" });
  }
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
