import { ref, computed } from "vue";
import {
  where,
  doc,
  getDoc,
  updateDoc,
  collection,
  query,
  getDocs,
  limit,
  where as whereFirestore,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import type { Firestore } from "firebase/firestore";

export interface Theme {
  id: string;
  title: string;
  description: string;
  available: boolean;
  reservedBy?: string;
  reservedById?: string;
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
      // Imprimir los IDs disponibles para depuración
      console.log(
        "[useThemes] Temáticas cargadas con IDs:",
        themes.value.map((theme) => ({
          id: theme.id,
          type: typeof theme.id,
          available: theme.available,
          title: theme.title.substring(0, 20), // Solo los primeros 20 caracteres para brevedad
        }))
      );
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

  // Función auxiliar para buscar una temática utilizando el ID numérico
  const findThemeByNumericId = async (numericId: string) => {
    const { $firestore } = useNuxtApp();
    const firestore = $firestore as Firestore;

    console.log(
      `[useThemes] [FINDTHEME] Buscando tema con ID numérico: ${numericId}`
    );

    try {
      // NUEVA ESTRATEGIA PRINCIPAL: Buscar en Firestore por el campo interno "id"
      console.log(
        `[useThemes] [FINDTHEME] Buscando tema con campo id igual a: ${numericId}`
      );

      const themesRef = collection(firestore, "themes");
      const q = query(themesRef, where("id", "==", numericId));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        // Debería haber solo un documento con este id interno
        const docSnapshot = querySnapshot.docs[0];
        const themeData = docSnapshot.data() as Theme;

        console.log(
          `[useThemes] [FINDTHEME] Tema encontrado por campo id: ${numericId}`,
          {
            firestoreId: docSnapshot.id,
            title: themeData.title,
          }
        );

        // Crear un nuevo objeto de tema con el ID real de Firestore
        const theme: Theme = {
          ...themeData,
          id: docSnapshot.id, // Sobrescribir el id con el ID real de Firestore
        };

        // Log detallado para confirmar que encontramos el tema correcto
        console.log(
          `[useThemes] [FINDTHEME] ✅ Se encontró correctamente el tema "${themeData.title}" con ID visual ${numericId} y ID real ${docSnapshot.id}`
        );

        return {
          success: true,
          theme,
          themeRef: docSnapshot.ref,
        };
      }

      console.log(
        `[useThemes] [FINDTHEME] No se encontró tema con campo id: ${numericId}, probando estrategias alternativas...`
      );

      // Estrategia 1: Buscar directamente en Firestore si el ID es numérico simple
      // Esto es para casos donde el ID en Firestore es exactamente el número
      if (/^\d+$/.test(numericId)) {
        console.log(
          `[useThemes] [FINDTHEME] Intentando buscar documento con ID exacto: ${numericId}`
        );
        const exactDocRef = doc(firestore, "themes", numericId);
        const exactDocSnap = await getDoc(exactDocRef);

        if (exactDocSnap.exists()) {
          console.log(
            `[useThemes] [FINDTHEME] Tema encontrado directamente con ID: ${numericId}`
          );
          const themeData = exactDocSnap.data() as Theme;
          // Crear un nuevo objeto de tema con el ID real de Firestore
          const theme: Theme = {
            ...themeData,
            id: numericId, // Sobrescribir el id con el ID real de Firestore
          };

          return {
            success: true,
            theme,
            themeRef: exactDocRef,
          };
        }
        console.log(
          `[useThemes] [FINDTHEME] No se encontró documento con ID exacto: ${numericId}, buscando alternativas...`
        );
      }

      // Estrategia 2: Buscar en el estado local por el campo id interno
      console.log(
        `[useThemes] [FINDTHEME] Buscando en cache local por campo id: ${numericId}`
      );
      const localTheme = themes.value.find((theme) => {
        // Comparar con el campo id interno directamente
        return String(theme.id) === String(numericId);
      });

      if (localTheme) {
        console.log(
          `[useThemes] [FINDTHEME] Tema encontrado localmente por campo id: ${numericId}`,
          {
            firestoreId: localTheme.id,
            title: localTheme.title,
          }
        );

        // Si tenemos el tema en caché local, necesitamos su referencia en Firestore
        // Primero intentar obtener todos los documentos y encontrar el que tenga el campo id correcto
        const allThemesSnapshot = await getDocs(themesRef);
        let firestoreDocRef = null;

        for (const docSnapshot of allThemesSnapshot.docs) {
          const data = docSnapshot.data();
          if (String(data.id) === String(numericId)) {
            firestoreDocRef = docSnapshot.ref;
            break;
          }
        }

        if (firestoreDocRef) {
          console.log(
            `[useThemes] [FINDTHEME] Documento verificado en Firestore por campo id: ${numericId}`
          );
          return {
            success: true,
            theme: localTheme,
            themeRef: firestoreDocRef,
          };
        } else {
          console.error(
            `[useThemes] [FINDTHEME] No se pudo encontrar el documento en Firestore con campo id: ${numericId}`
          );
        }
      }

      console.log(
        `[useThemes] [FINDTHEME] No se encontró tema con ID numérico: ${numericId}`
      );
      return {
        success: false,
        error: "No se encontró la temática con ese número",
      };
    } catch (error) {
      console.error(
        `[useThemes] [FINDTHEME] Error buscando tema con ID numérico: ${numericId}`,
        error
      );
      return {
        success: false,
        error: "Error al buscar la temática",
      };
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
      const { $firestore } = useNuxtApp();
      const firestore = $firestore as Firestore;

      // Obtener la configuración del sistema
      const appConfig = useState<any>("appConfig");
      if (!appConfig.value?.isReservationEnabled) {
        return {
          success: false,
          error:
            "La reserva de temáticas está deshabilitada temporalmente por el administrador",
        };
      }

      // Asegurar que el ID es string
      const themeIdStr = String(themeId);
      const numericId = themeIdStr.replace(/\D/g, "");

      console.log("[useThemes] [RESERVA] Intentando reservar temática:", {
        idRecibido: themeId,
        idComoString: themeIdStr,
        idNumerico: numericId,
        tipo: typeof themeId,
        tematicasDisponibles: themes.value.length,
      });

      // 1. Verificar que el usuario no tenga ya una temática reservada
      const userRef = doc(firestore, "users", userId);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();

        // Si el usuario ya tiene una temática reservada, no permitir otra reserva
        if (userData.reservedTheme) {
          return {
            success: false,
            error:
              "Ya tienes una temática reservada. No puedes reservar más de una temática por usuario.",
          };
        }
      }

      // 2. Buscar la temática usando nuestra función auxiliar
      const themeResult = await findThemeByNumericId(numericId);

      if (!themeResult.success || !themeResult.theme || !themeResult.themeRef) {
        return {
          success: false,
          error:
            themeResult.error || "La temática no existe o ha sido eliminada",
        };
      }

      const foundTheme = themeResult.theme;
      const themeDocRef = themeResult.themeRef;

      console.log("[useThemes] [RESERVA] Tema encontrado:", {
        id: foundTheme.id,
        titulo: foundTheme.title,
        refPath: themeDocRef.path,
        displayId: foundTheme.id,
        documentoCompleto: JSON.stringify(foundTheme),
      });

      // 3. Verificar que la temática está disponible
      if (!foundTheme.available) {
        return {
          success: false,
          error: "Esta temática ya ha sido reservada por otro usuario",
        };
      }

      // 4. Actualizar la temática como reservada
      console.log(
        `[useThemes] [RESERVA] Actualizando documento en la ruta: ${themeDocRef.path}`
      );

      // Log extra para confirmar que estamos reservando el tema correcto
      console.log(
        `[useThemes] [RESERVA] ✅ Reservando correctamente el tema "${
          foundTheme.title
        }" con ID visual ${foundTheme.id.replace(/\D/g, "")} e ID real ${
          themeDocRef.id
        }`
      );

      await updateDoc(themeDocRef, {
        available: false,
        reservedBy: userName,
        reservedAt: new Date(),
        reservedById: userId,
      });

      // 5. Actualizar el perfil del usuario con la referencia a la temática reservada
      await updateDoc(userRef, {
        reservedTheme: {
          id: foundTheme.id,
          title: foundTheme.title,
          reservedAt: new Date(),
        },
      });

      // Recargar las temáticas para reflejar los cambios
      console.log(
        "[useThemes] [RESERVA] Reserva completada, recargando temáticas"
      );
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
      // Asegurar que el ID es string
      const themeIdStr = String(id);
      return await getDocumentById(themeIdStr);
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
