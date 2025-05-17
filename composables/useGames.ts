import { ref, computed } from "vue";
import {
  where,
  doc,
  getDoc,
  updateDoc,
  collection,
  query,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import type { Firestore } from "firebase/firestore";
import type { Theme } from "./useThemes";

export interface Game extends Theme {
  gameStatus?: "not_started" | "in_progress" | "completed";
  gameUrl?: string;
  repositoryUrl?: string;
  lastUpdated?: Date | string;
}

export function useGames() {
  const { $firestore } = useNuxtApp();

  const games = ref<Game[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Cargar todos los juegos (temáticas reservadas)
  const fetchAllGames = async () => {
    loading.value = true;
    error.value = null;
    games.value = [];

    try {
      const firestore = $firestore as Firestore;

      // Obtener temáticas reservadas (available = false)
      const themesCollection = collection(firestore, "themes");
      const q = query(themesCollection, where("available", "==", false));

      const querySnapshot = await getDocs(q);

      const gamesData: Game[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data() as Game;

        // Tratar cada temática reservada como un juego
        gamesData.push({
          ...data,
          // Preservamos el campo id interno si existe
          id: data.id || doc.id,
          // Guardar el ID del documento de Firestore en un campo diferente para referencia
          _docId: doc.id,
          // Establecer gameStatus por defecto si no existe
          gameStatus: data.gameStatus || "not_started",
        });
      });

      games.value = gamesData;
      console.log("[useGames] Juegos cargados:", games.value.length);
    } catch (err) {
      console.error("[useGames] Error al cargar juegos:", err);
      error.value = err instanceof Error ? err.message : "Error desconocido";
    } finally {
      loading.value = false;
    }
  };

  // Obtener un juego por ID
  const getGameById = async (id: string): Promise<Game | null> => {
    try {
      const firestore = $firestore as Firestore;

      // Verificar si tenemos el juego en caché
      const cachedGame = games.value.find((game) => game.id === id);
      if (cachedGame) {
        return cachedGame;
      }

      // Si no está en caché, buscarlo en Firestore
      const gameRef = doc(firestore, "themes", id);
      const gameSnapshot = await getDoc(gameRef);

      if (gameSnapshot.exists()) {
        const gameData = gameSnapshot.data() as Game;

        // Verificar que es un juego (temática reservada)
        if (!gameData.available) {
          return {
            ...gameData,
            id: gameSnapshot.id,
            gameStatus: gameData.gameStatus || "not_started",
          };
        } else {
          // Si está disponible, no es un juego
          console.warn(
            "[useGames] El documento solicitado no es un juego (está disponible):",
            id
          );
          return null;
        }
      } else {
        console.warn("[useGames] No se encontró el juego con ID:", id);
        return null;
      }
    } catch (err) {
      console.error("[useGames] Error al obtener juego por ID:", err);
      return null;
    }
  };

  // Actualizar el estado de un juego
  const updateGameStatus = async (
    gameId: string,
    gameData: {
      gameStatus?: "not_started" | "in_progress" | "completed";
      gameUrl?: string;
      repositoryUrl?: string;
    }
  ) => {
    loading.value = true;
    error.value = null;

    try {
      const firestore = $firestore as Firestore;
      const gameRef = doc(firestore, "themes", gameId);

      // Verificar que el documento existe y es un juego
      const gameSnapshot = await getDoc(gameRef);

      if (!gameSnapshot.exists()) {
        throw new Error("El juego no existe");
      }

      const data = gameSnapshot.data();
      if (data.available) {
        throw new Error("El documento no es un juego (está disponible)");
      }

      // Preparar datos de actualización
      const updateData = {
        ...gameData,
        lastUpdated: new Date(),
      };

      // Actualizar el juego
      await updateDoc(gameRef, updateData);

      // Actualizar en caché local si existe
      const index = games.value.findIndex((game) => game.id === gameId);
      if (index !== -1) {
        games.value[index] = {
          ...games.value[index],
          ...updateData,
        };
      }

      return { success: true };
    } catch (err) {
      console.error("[useGames] Error al actualizar estado del juego:", err);
      error.value = err instanceof Error ? err.message : "Error desconocido";
      return {
        success: false,
        error: error.value,
      };
    } finally {
      loading.value = false;
    }
  };

  // Obtener estadísticas de juegos
  const getGameStats = computed(() => {
    const total = games.value.length;
    const inProgress = games.value.filter(
      (game) => game.gameStatus === "in_progress"
    ).length;
    const completed = games.value.filter(
      (game) => game.gameStatus === "completed"
    ).length;
    const notStarted = games.value.filter(
      (game) => !game.gameStatus || game.gameStatus === "not_started"
    ).length;

    return {
      total,
      inProgress,
      completed,
      notStarted,
    };
  });

  // Filtrar juegos por estado
  const gamesByStatus = computed(() => {
    return {
      notStarted: games.value.filter(
        (game) => !game.gameStatus || game.gameStatus === "not_started"
      ),
      inProgress: games.value.filter(
        (game) => game.gameStatus === "in_progress"
      ),
      completed: games.value.filter((game) => game.gameStatus === "completed"),
    };
  });

  // Obtener juegos por desarrollador
  const getGamesByDeveloper = (userId: string) => {
    return games.value.filter((game) => game.reservedById === userId);
  };

  return {
    games,
    loading,
    error,
    fetchAllGames,
    getGameById,
    updateGameStatus,
    getGameStats,
    gamesByStatus,
    getGamesByDeveloper,
  };
}
