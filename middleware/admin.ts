/**
 * Middleware para proteger rutas de administrador
 *
 * Verifica si el usuario está autenticado y tiene rol de administrador antes de permitir el acceso.
 * Si no tiene los permisos necesarios, redirige a la página principal.
 */
export default defineNuxtRouteMiddleware(async (to, from) => {
  const { isAuthenticated, user } = useAuth();

  // Si el usuario no está autenticado, redirigir a login
  if (!isAuthenticated.value) {
    return navigateTo({
      path: "/ingresar",
      query: { redirect: to.fullPath },
    });
  }

  // Verificar si el usuario tiene rol de administrador
  // Esta verificación dependerá de cómo están almacenados los roles en tu aplicación
  // Para este ejemplo, asumimos que hay un campo 'role' en el objeto user o se obtiene
  // de Firestore usando el UID del usuario.

  // Método provisional - en una implementación real debes consultar Firestore o usar claims
  const isAdmin = user.value?.email?.includes("@santotomas.cl") || false;

  if (!isAdmin) {
    // Si no es admin, redirigir a la página principal con un mensaje
    return navigateTo({
      path: "/",
      query: { message: "no_access" },
    });
  }
});
