import { getAuth, signOut } from "firebase/auth";

/**
 * Plugin para proporcionar una función de cierre de sesión consistente
 * Este plugin es específico para resolver problemas de cierre de sesión
 */
export default defineNuxtPlugin((nuxtApp) => {
  const logoutUser = async () => {
    console.log("[Logout Plugin] Iniciando cierre de sesión...");
    try {
      const auth = getAuth();
      if (!auth) {
        console.error("[Logout Plugin] Error: auth no está disponible");
        return { success: false, error: "Auth service not available" };
      }

      // Obtener estado
      const userState = useState("user");
      const userDataState = useState("userData");

      // Primero cerrar sesión en Firebase
      console.log("[Logout Plugin] Cerrando sesión en Firebase Auth...");
      await signOut(auth);
      console.log(
        "[Logout Plugin] Sesión cerrada correctamente en Firebase Auth"
      );

      // Después limpiar estados locales
      userState.value = null;
      userDataState.value = null;
      console.log("[Logout Plugin] Estado local de usuario limpiado");

      // Intentar limpiar tokens y cookies si existen
      try {
        if (typeof localStorage !== "undefined") {
          // Eliminar cualquier token relacionado con Firebase
          localStorage.removeItem("firebase:authUser");
          localStorage.removeItem("nuxt-firebase-auth-user");
          console.log("[Logout Plugin] Tokens de localStorage limpiados");
        }

        if (typeof sessionStorage !== "undefined") {
          sessionStorage.clear();
          console.log("[Logout Plugin] SessionStorage limpiado");
        }
      } catch (e) {
        console.warn("[Logout Plugin] Error al limpiar storage:", e);
      }

      return { success: true };
    } catch (error) {
      console.error("[Logout Plugin] Error al cerrar sesión:", error);
      return { success: false, error };
    }
  };

  // Proporcionar la función solo una vez
  return {
    provide: {
      logoutUser,
    },
  };
});
