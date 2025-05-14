/**
 * Middleware para verificar si el usuario es administrador
 * - Redirige a la página de inicio si el usuario no está autenticado
 * - Redirige a la página de acceso denegado si el usuario no es administrador
 */
import { navigateTo } from "#app";

export default defineNuxtRouteMiddleware(async (to, from) => {
  const { isAuthenticated, user, waitForAuthInitialized } = useAuth();

  // Esperar a que se complete la verificación de autenticación
  await waitForAuthInitialized();

  // Si el usuario no está autenticado, redirigir al inicio de sesión
  if (!isAuthenticated.value) {
    return navigateTo("/ingresar");
  }

  // Verificar si el usuario es administrador (correo institucional)
  if (!user.value?.email?.endsWith("@santotomas.cl")) {
    // Redirigir a una página de acceso denegado
    return navigateTo("/acceso-denegado");
  }
});
