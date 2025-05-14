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

      // Limpiar estados de usuario
      useState("user").value = null;
      useState("userData").value = null;
      console.log("[Logout Plugin] Estado de usuario limpiado");

      // Cerrar sesión en Firebase
      await signOut(auth);
      console.log("[Logout Plugin] Sesión cerrada correctamente");

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
