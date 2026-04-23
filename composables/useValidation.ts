import { useFirebase } from "./useFirebase";
import { isRegistrationEmailFormatAllowed } from "~/utils/registration-email";

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
      if (!isRegistrationEmailFormatAllowed(email)) {
        error.value =
          "El correo debe ser institucional (@alumnos.santotomas.cl o @santotomas.cl) o un correo autorizado para pruebas";
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

  const isValidInstitutionalEmail = (email: string) =>
    isRegistrationEmailFormatAllowed(email);

  return {
    isLoading,
    error,
    validateEmail,
    isValidInstitutionalEmail,
  };
};
