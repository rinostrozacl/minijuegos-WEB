/**
 * Composable para manejar validaciones, incluyendo la verificación de correos electrónicos
 */
export const useValidation = () => {
  const isLoading = ref(false);
  const error = ref("");

  /**
   * Verifica si un correo electrónico está permitido para registrarse
   * @param email Correo electrónico a validar
   * @returns Resultado de la validación
   */
  const validateEmail = async (email: string) => {
    isLoading.value = true;
    error.value = "";

    try {
      const { data, error: fetchError } = await useFetch(
        "/api/auth/validate-email",
        {
          method: "POST",
          body: { email },
        }
      );

      if (fetchError.value) {
        console.error("Error al validar correo:", fetchError.value);
        error.value =
          "Error al validar el correo electrónico. Inténtalo de nuevo.";
        return { success: false, message: error.value };
      }

      // Si hay un resultado y no es exitoso, establecer el mensaje de error
      if (data.value && !data.value.success) {
        error.value = data.value.message || "Correo no válido para el registro";
        return { success: false, message: error.value };
      }

      return {
        success: true,
        message: data.value?.message || "Correo válido",
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
