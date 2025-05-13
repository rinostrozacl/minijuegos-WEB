import { ref, computed } from "vue";
import { where } from "firebase/firestore";

export interface Theme {
  id: string;
  title: string;
  description: string;
  available: boolean;
  reservedBy?: string;
  reservedAt?: Date | string;
  createdAt: Date | string;
  image?: string;
  tags?: string[];
  category?: string; // Categoría principal
}

export function useThemes() {
  const {
    items: themes,
    loading,
    error,
    getDocuments,
    getDocumentById,
    updateDocument,
  } = useFirestore<Theme>("themes");

  const isLoading = ref(false);

  // Cargar todas las temáticas
  const fetchAllThemes = async () => {
    isLoading.value = true;
    try {
      await getDocuments([], { field: "id", direction: "asc" });
    } catch (err) {
      console.error("Error al cargar temáticas:", err);
    } finally {
      isLoading.value = false;
    }
  };

  // Cargar solo temáticas disponibles
  const fetchAvailableThemes = async () => {
    isLoading.value = true;
    try {
      await getDocuments([where("available", "==", true)], {
        field: "id",
        direction: "asc",
      });
    } catch (err) {
      console.error("Error al cargar temáticas disponibles:", err);
    } finally {
      isLoading.value = false;
    }
  };

  // Cargar solo temáticas reservadas
  const fetchReservedThemes = async () => {
    isLoading.value = true;
    try {
      await getDocuments([where("available", "==", false)], {
        field: "id",
        direction: "asc",
      });
    } catch (err) {
      console.error("Error al cargar temáticas reservadas:", err);
    } finally {
      isLoading.value = false;
    }
  };

  // Cargar temáticas por categoría
  const fetchThemesByCategory = async (category: string) => {
    isLoading.value = true;
    try {
      await getDocuments([where("tags", "array-contains", category)], {
        field: "id",
        direction: "asc",
      });
    } catch (err) {
      console.error(
        `Error al cargar temáticas de la categoría ${category}:`,
        err
      );
    } finally {
      isLoading.value = false;
    }
  };

  // Buscar temáticas por texto
  const searchThemes = async (query: string) => {
    // Nota: Firestore no tiene búsqueda de texto nativa, así que hacemos la búsqueda en el cliente
    // Primero cargamos todas las temáticas y luego filtramos
    isLoading.value = true;
    try {
      await fetchAllThemes();
      return themes.value.filter(
        (theme) =>
          theme.title.toLowerCase().includes(query.toLowerCase()) ||
          theme.description.toLowerCase().includes(query.toLowerCase()) ||
          (theme.tags &&
            theme.tags.some((tag) =>
              tag.toLowerCase().includes(query.toLowerCase())
            ))
      );
    } catch (err) {
      console.error("Error al buscar temáticas:", err);
      return [];
    } finally {
      isLoading.value = false;
    }
  };

  // Reservar una temática
  const reserveTheme = async (
    themeId: string,
    userId: string,
    userName: string
  ) => {
    isLoading.value = true;
    try {
      const success = await updateDocument(themeId, {
        available: false,
        reservedBy: userName,
        reservedAt: new Date(),
      });

      if (!success) {
        throw new Error("No se pudo reservar la temática");
      }

      // Recargar las temáticas para reflejar los cambios
      await fetchAllThemes();

      return { success: true };
    } catch (err) {
      console.error("Error al reservar temática:", err);
      return {
        success: false,
        error:
          err instanceof Error
            ? err.message
            : "Error desconocido al reservar temática",
      };
    } finally {
      isLoading.value = false;
    }
  };

  // Obtener una temática por ID
  const getThemeById = async (id: string) => {
    try {
      return await getDocumentById(id);
    } catch (err) {
      console.error(`Error al obtener temática con ID ${id}:`, err);
      return null;
    }
  };

  // Obtener todas las categorías únicas de las temáticas
  const getAllCategories = computed(() => {
    const categories = new Set<string>();

    themes.value.forEach((theme) => {
      if (theme.tags && theme.tags.length > 0) {
        theme.tags.forEach((tag) => categories.add(tag));
      }
    });

    return Array.from(categories).sort();
  });

  // Computed properties para filtrar temáticas
  const availableThemes = computed(() =>
    themes.value.filter((theme) => theme.available)
  );

  const reservedThemes = computed(() =>
    themes.value.filter((theme) => !theme.available)
  );

  // Agrupar temáticas por categoría
  const themesByCategory = computed(() => {
    const grouped: Record<string, Theme[]> = {};

    themes.value.forEach((theme) => {
      if (theme.tags && theme.tags.length > 0) {
        // Usar la primera etiqueta como categoría principal
        const mainCategory = theme.tags[0];

        if (!grouped[mainCategory]) {
          grouped[mainCategory] = [];
        }

        grouped[mainCategory].push(theme);
      } else {
        // Para temáticas sin etiquetas
        if (!grouped["Sin categoría"]) {
          grouped["Sin categoría"] = [];
        }

        grouped["Sin categoría"].push(theme);
      }
    });

    return grouped;
  });

  return {
    themes,
    availableThemes,
    reservedThemes,
    themesByCategory,
    getAllCategories,
    loading,
    error,
    isLoading,
    fetchAllThemes,
    fetchAvailableThemes,
    fetchReservedThemes,
    fetchThemesByCategory,
    searchThemes,
    reserveTheme,
    getThemeById,
  };
}
