/**
 * Lista de correos electrónicos permitidos para registrarse en la plataforma
 * Esta lista debe ser actualizada manualmente cuando se quieran añadir nuevos usuarios
 */
export const allowedEmails = [
  // Alumnos
  "c.toledo71@alumnos.santotomas.cl",
  "c.vera116@alumnos.santotomas.cl",
  "h.gallegos@alumnos.santotomas.cl",
  "j.oporto5@alumnos.santotomas.cl",
  "k.perez66@alumnos.santotomas.cl",
  "a.leiva42@alumnos.santotomas.cl",
  "b.ruiz32@alumnos.santotomas.cl",
  "b.vega30@alumnos.santotomas.cl",
  "c.casin@alumnos.santotomas.cl",
  "c.delao@alumnos.santotomas.cl",
  "c.robarte@alumnos.santotomas.cl",
  "c.alvarado85@alumnos.santotomas.cl",
  "e.gonzalez137@alumnos.santotomas.cl",
  "f.munoz196@alumnos.santotomas.cl",
  "f.orellana51@alumnos.santotomas.cl",
  "f.vargas44@alumnos.santotomas.cl",
  "f.solis15@alumnos.santotomas.cl",
  "g.huanca2@alumnos.santotomas.cl",
  "j.lopez111@alumnos.santotomas.cl",
  "j.alarcon72@alumnos.santotomas.cl",
  "l.chavez15@alumnos.santotomas.cl",
  "l.carcamo8@alumnos.santotomas.cl",
  "m.alarcon83@alumnos.santotomas.cl",
  "o.morales10@alumnos.santotomas.cl",
  "p.navarro32@alumnos.santotomas.cl",
  "r.ruiz21@alumnos.santotomas.cl",
  "s.ovalle5@alumnos.santotomas.cl",
  "s.almonacid13@alumnos.santotomas.cl",
  "v.fuentes43@alumnos.santotomas.cl",
  "v.neira11@alumnos.santotomas.cl",

  // Profesores/Administradores
  "ricardoinostrozare@santotomas.cl",
];

/**
 * Verifica si un correo está en la lista de correos permitidos
 * @param email Correo electrónico a verificar
 * @returns true si el correo está permitido, false en caso contrario
 */
export function isEmailAllowed(email: string): boolean {
  return allowedEmails.includes(email.toLowerCase());
}
