import {
  doc,
  getDoc,
  updateDoc,
  setDoc,
  serverTimestamp,
  onSnapshot,
} from "firebase/firestore";
import type { Firestore } from "firebase/firestore";

// Definir tipos para la configuración
export interface AppConfig {
  // ID único del documento de configuración
  id: string;

  // Determina si los usuarios pueden reservar temáticas
  isReservationEnabled: boolean;

  // Fase actual del concurso según las bases
  // Ejemplo: "preparation", "submission", "evaluation", "announcement", "finished"
  currentPhase: string;

  // Determina si se permite el registro de nuevos usuarios
  isRegistrationEnabled: boolean;

  // Año actual del concurso
  currentYear: number;

  // Información de cuando se actualizó por última vez
  lastUpdated?: any;

  // Campos adicionales como fechas importantes, etc
  [key: string]: any;
}

// Configuración por defecto
const DEFAULT_CONFIG: AppConfig = {
  id: "systemConfig",
  isReservationEnabled: false,
  currentPhase: "preparation",
  isRegistrationEnabled: true,
  currentYear: new Date().getFullYear(),
};

// ID del documento de configuración en Firestore
const CONFIG_DOC_ID = "systemConfig";
// Nombre de la colección de configuración
const CONFIG_COLLECTION = "appConfig";

export const useSystemConfig = () => {
  const { $firestore } = useNuxtApp();
  const firestore = $firestore as Firestore;

  // Estado reactivo para la configuración
  const config = useState<AppConfig>("appConfig", () => ({
    ...DEFAULT_CONFIG,
  }));
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const isConfigLoaded = useState<boolean>("isConfigLoaded", () => false);

  /**
   * Cargar la configuración desde Firestore
   */
  const loadConfig = async () => {
    if (!firestore) {
      console.error("Firestore no está disponible");
      error.value = "Firestore no está disponible";
      return null;
    }

    isLoading.value = true;
    error.value = null;

    try {
      const configRef = doc(firestore, CONFIG_COLLECTION, CONFIG_DOC_ID);
      const configDoc = await getDoc(configRef);

      if (configDoc.exists()) {
        const configData = configDoc.data() as AppConfig;
        config.value = { ...configData };
        console.log("Configuración cargada:", config.value);
      } else {
        console.log(
          "No existe documento de configuración, creando uno por defecto..."
        );
        await createDefaultConfig();
      }

      isConfigLoaded.value = true;
      return config.value;
    } catch (err: any) {
      console.error("Error al cargar configuración:", err);
      error.value = err.message;
      return null;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Crear configuración por defecto si no existe
   */
  const createDefaultConfig = async () => {
    if (!firestore) {
      console.error("Firestore no está disponible");
      return false;
    }

    try {
      const configRef = doc(firestore, CONFIG_COLLECTION, CONFIG_DOC_ID);
      const defaultConfig = {
        ...DEFAULT_CONFIG,
        lastUpdated: serverTimestamp(),
      };

      await setDoc(configRef, defaultConfig);
      config.value = { ...defaultConfig, lastUpdated: new Date() };
      console.log("Configuración por defecto creada");
      return true;
    } catch (err) {
      console.error("Error al crear configuración por defecto:", err);
      return false;
    }
  };

  /**
   * Actualizar la configuración
   * @param newConfig Nueva configuración parcial o completa
   */
  const updateConfig = async (newConfig: Partial<AppConfig>) => {
    if (!firestore) {
      console.error("Firestore no está disponible");
      error.value = "Firestore no está disponible";
      return false;
    }

    isLoading.value = true;
    error.value = null;

    try {
      const configRef = doc(firestore, CONFIG_COLLECTION, CONFIG_DOC_ID);

      // Asegurarse de que el documento existe antes de actualizarlo
      const configDoc = await getDoc(configRef);
      if (!configDoc.exists()) {
        await createDefaultConfig();
      }

      // Preparar datos a actualizar
      const updateData = {
        ...newConfig,
        lastUpdated: serverTimestamp(),
      };

      // Asegurarse de no sobrescribir el ID
      delete updateData.id;

      await updateDoc(configRef, updateData);

      // Actualizar estado local
      config.value = {
        ...config.value,
        ...newConfig,
        lastUpdated: new Date(),
      };

      console.log("Configuración actualizada:", config.value);
      return true;
    } catch (err: any) {
      console.error("Error al actualizar configuración:", err);
      error.value = err.message;
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Suscribirse a cambios en la configuración
   * @returns Función para cancelar la suscripción
   */
  const subscribeToConfigChanges = () => {
    if (!firestore) {
      console.error("Firestore no está disponible");
      return () => {};
    }

    const configRef = doc(firestore, CONFIG_COLLECTION, CONFIG_DOC_ID);

    const unsubscribe = onSnapshot(
      configRef,
      (doc) => {
        if (doc.exists()) {
          config.value = doc.data() as AppConfig;
          console.log(
            "Configuración actualizada en tiempo real:",
            config.value
          );
        }
      },
      (err) => {
        console.error("Error en suscripción a configuración:", err);
      }
    );

    return unsubscribe;
  };

  // Cargar la configuración inicialmente si no está cargada
  if (!isConfigLoaded.value) {
    loadConfig();
  }

  return {
    config,
    isLoading,
    error,
    isConfigLoaded,
    loadConfig,
    updateConfig,
    subscribeToConfigChanges,
  };
};
