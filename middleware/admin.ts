/**
 * Middleware para proteger rutas de administrador
 *
 * Verifica si el usuario está autenticado y tiene rol de administrador antes de permitir el acceso.
 * Si no tiene los permisos necesarios, redirige a la página principal.
 */
import { navigateTo } from "#app";

export default defineNuxtRouteMiddleware(async (to, from) => {
  const { isAuthenticated, user, isAdmin, waitForAuthInitialized } = useAuth();

  // Esperar a que la autenticación esté inicializada
  await waitForAuthInitialized();

  // Si no está autenticado, redirigir a login
  if (!isAuthenticated.value) {
    console.log(
      "[Admin Middleware] Usuario no autenticado, redirigiendo a login"
    );
    return navigateTo({
      path: "/ingresar",
      query: { redirect: to.fullPath },
    });
  }

  // Si el email no está verificado, redirigir a verificación
  if (!user.value?.emailVerified) {
    console.log(
      "[Admin Middleware] Email no verificado, redirigiendo a verificación"
    );
    return navigateTo("/verificar-email");
  }

  // Si no es admin, redirigir a la página principal
  if (!isAdmin.value) {
    console.log(
      "[Admin Middleware] Usuario no tiene permisos de administrador"
    );
    useToast().add({
      title: "Acceso denegado",
      description: "No tienes permisos para acceder a esta sección",
      icon: "i-heroicons-shield-exclamation",
      color: "error",
    });
    return navigateTo("/");
  }

  // Si todo está bien, permitir acceso
  console.log("[Admin Middleware] Acceso a administración permitido");
});
