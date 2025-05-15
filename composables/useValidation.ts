import { useFirebase } from "./useFirebase";

/**
 * Composable para manejar validaciones, incluyendo la verificación de correos electrónicos
 */
export const useValidation = () => {
  const isLoading = ref(false);
  const error = ref("");
  const { isEmailAllowed } = useFirebase();

  /**
   * Verifica si un correo electrónico está permitido para registrarse
   * @param email Correo electrónico a validar
   * @returns Resultado de la validación
   */
  const validateEmail = async (email: string) => {
    isLoading.value = true;
    error.value = "";

    try {
      // Validar formato de correo básico antes de consultar a Firebase
      const emailRegex = /^[a-zA-Z0-9._-]+@(alumnos\.|)santotomas\.cl$/;
      if (!emailRegex.test(email)) {
        error.value =
          "El correo debe ser un correo institucional (@alumnos.santotomas.cl o @santotomas.cl)";
        return { success: false, message: error.value };
      }

      // Consultar directamente a Firebase si el correo está permitido
      const result = await isEmailAllowed(email);

      if (!result.success) {
        error.value = result.message;
        return { success: false, message: error.value };
      }

      if (!result.isAllowed) {
        error.value = result.message;
        return { success: false, message: error.value };
      }

      return {
        success: true,
        message: result.message || "Correo válido",
        userType: result.userType,
      };
    } catch (err) {
      console.error("Error inesperado al validar correo:", err);
      error.value = "Error inesperado al validar el correo electrónico";
      return { success: false, message: error.value };
    } finally {
      isLoading.value = false;
    }
  };

  return {
    isLoading,
    error,
    validateEmail,
  };
};
