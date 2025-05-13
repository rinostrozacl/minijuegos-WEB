/**
 * Middleware de autenticación para proteger rutas que requieren login
 *
 * Verifica si el usuario está autenticado antes de permitir el acceso a la ruta.
 * Si no está autenticado, redirige a la página de inicio de sesión.
 */
export default defineNuxtRouteMiddleware(async (to, from) => {
  // Solo ejecutar en el cliente
  if (process.server) {
    console.log(
      "[Auth Middleware] Ejecutando en servidor, posponiendo verificación al cliente"
    );
    return;
  }

  const { isAuthenticated, waitForAuthInitialized, user } = useAuth();

  try {
    // Esperar a que la autenticación esté inicializada antes de tomar decisiones
    await waitForAuthInitialized();

    // Comprobar si el usuario está autenticado después de la inicialización
    if (!isAuthenticated.value) {
      console.log(
        `[Auth Middleware] Ruta protegida: ${to.fullPath}. Usuario no autenticado.`
      );

      // Guardar la ruta a la que se intentaba acceder para redirigir después del login
      return navigateTo({
        path: "/ingresar",
        query: { redirect: to.fullPath },
      });
    }

    console.log(
      `[Auth Middleware] Acceso permitido a ruta protegida: ${to.fullPath}. Usuario autenticado: ${user.value?.email}`
    );
  } catch (error) {
    console.error("[Auth Middleware] Error verificando autenticación:", error);

    // En caso de error, redirigir a login por seguridad
    return navigateTo({
      path: "/ingresar",
      query: { redirect: to.fullPath },
    });
  }
});
