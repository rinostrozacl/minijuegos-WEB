/**
 * Plugin para asegurar compatibilidad entre diferentes formatos de íconos en la aplicación.
 *
 * Este plugin intercepta el uso de UIcon y asegura que los nombres de íconos sean
 * correctamente transformados al formato esperado por @nuxt/icon.
 */
import { defineNuxtPlugin } from "#app";
import { useIcons } from "~/composables/useIcons";

export default defineNuxtPlugin((nuxtApp) => {
  // Acceso al composable de íconos
  const { getIconName } = useIcons();

  // Intercepta el componente UIcon para transformar los nombres antiguos
  nuxtApp.vueApp.directive("icon-compat", {
    mounted(el) {
      // Buscar elementos UIcon dentro del elemento con la directiva
      const iconElements = el.querySelectorAll(
        "[name^='i-heroicons-'], [name^='i-simple-icons-']"
      );

      // Transformar los nombres si se encuentran elementos
      iconElements.forEach((iconEl: Element) => {
        const oldName = iconEl.getAttribute("name");
        if (oldName) {
          const newName = getIconName(oldName);
          iconEl.setAttribute("name", newName);
        }
      });
    },
  });

  // Registro de un helper para debugging
  return {
    provide: {
      formatIconName: getIconName,
    },
  };
});
