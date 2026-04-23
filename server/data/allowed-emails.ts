/**
 * Lista de correos electrónicos permitidos para registrarse en la plataforma.
 * Debe alinearse con la colección Firestore `allowed-emails`.
 * Sincronizar a Firestore: `node scripts/sync-allowed-emails-from-ts.mjs`
 */
export const allowedEmails = [
  // Administrador
  "ricardoinostrozare@santotomas.cl",

  // Estudiantes (cohorte actual)
  "b.guzman21@alumnos.santotomas.cl",
  "b.lineros2@alumnos.santotomas.cl",
  "b.millalonco2@alumnos.santotomas.cl",
  "b.vasquez48@alumnos.santotomas.cl",
  "c.herrera134@alumnos.santotomas.cl",
  "c.mansilla64@alumnos.santotomas.cl",
  "c.segovia29@alumnos.santotomas.cl",
  "d.catin@alumnos.santotomas.cl",
  "d.siefert@alumnos.santotomas.cl",
  "d.vera63@alumnos.santotomas.cl",
  "e.carcamo15@alumnos.santotomas.cl",
  "f.oyarzo20@alumnos.santotomas.cl",
  "g.contreras54@alumnos.santotomas.cl",
  "g.guerrero20@alumnos.santotomas.cl",
  "j.melipillan@alumnos.santotomas.cl",
  "j.rebolledo28@alumnos.santotomas.cl",
  "j.velasquez59@alumnos.santotomas.cl",
  "m.fuentes160@alumnos.santotomas.cl",
  "m.mella21@alumnos.santotomas.cl",
  "m.rogel6@alumnos.santotomas.cl",
  "m.ruiz86@alumnos.santotomas.cl",
  "m.vera105@alumnos.santotomas.cl",
  "n.cosme3@alumnos.santotomas.cl",
  "p.osorio19@alumnos.santotomas.cl",
  "p.riedemann1@alumnos.santotomas.cl",
  "p.soto87@alumnos.santotomas.cl",
  "r.gallardo28@alumnos.santotomas.cl",
  "r.loaiza3@alumnos.santotomas.cl",
  "r.ruiz21@alumnos.santotomas.cl",
  "s.contreras88@alumnos.santotomas.cl",

  // Pruebas (no institucional; requiere estar en REGISTRATION_EMAIL_TEST_ALLOWLIST)
  "rinostrozareb@gmail.com",
];

/**
 * Verifica si un correo está en la lista de correos permitidos
 * @param email Correo electrónico a verificar
 * @returns true si el correo está permitido, false en caso contrario
 */
export function isEmailAllowed(email: string): boolean {
  return allowedEmails.includes(email.toLowerCase());
}
