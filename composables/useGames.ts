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

// Extender la interfaz Game para incluir propiedades relacionadas con equipos
export interface Game extends Theme {
  gameStatus?: "not_started" | "in_progress" | "completed";
  gameUrl?: string;
  repositoryUrl?: string;
  lastUpdated?: Date | string;
  teammateEmail?: string; // Email del compañero de equipo
  teammateUid?: string; // UID del compañero de equipo
  teammateName?: string; // Nombre del compañero de equipo
  teamRole?: "owner" | "teammate"; // Rol en el equipo (propietario o compañero)
  _docId?: string; // ID del documento para referencias internas
  gameImage?: string; // URL de la imagen del juego
  gameImagePath?: string; // Ruta en Storage de la imagen para facilitar eliminación
}

// Interfaz para datos de usuario
interface UserData {
  id: string;
  email?: string;
  displayName?: string;
  reservedTheme?: {
    id: string;
    title: string;
    reservedAt: Date | string;
    teamRole?: string;
  };
  [key: string]: any;
}

export function useGames() {
  const { $firestore } = useNuxtApp();

  const games = ref<Game[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const isRefreshingTeammates = ref(false);

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

  // Obtener información de usuario por email
  const getUserByEmail = async (email: string): Promise<UserData | null> => {
    try {
      const firestore = $firestore as Firestore;

      // Buscar el usuario en Firestore por su email
      const usersCollection = collection(firestore, "users");
      const q = query(usersCollection, where("email", "==", email));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return null;
      }

      // Obtener los datos del usuario
      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();

      return {
        id: userDoc.id,
        ...userData,
      };
    } catch (err) {
      console.error("[useGames] Error al obtener usuario por email:", err);
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
      gameImage?: string;
      gameImagePath?: string;
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

  // Añadir un compañero al equipo de desarrollo
  const addTeammate = async (gameId: string, teammateEmail: string) => {
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

      // Verificar si ya hay un compañero asignado
      if (data.teammateEmail) {
        throw new Error("Este juego ya tiene un compañero asignado");
      }

      // Buscar el usuario en Firestore por su email
      const userInfo = await getUserByEmail(teammateEmail);

      if (!userInfo) {
        throw new Error(
          "No se encontró ningún usuario con ese correo electrónico"
        );
      }

      // Obtener el UID y nombre del usuario
      const userUid = userInfo.id;
      const userName = userInfo.displayName || userInfo.email || "Sin nombre";

      // Verificar que el usuario no tenga ya una temática reservada o sea compañero en otra
      if (userInfo.reservedTheme) {
        throw new Error(
          "Este usuario ya tiene una temática reservada o es compañero en otra"
        );
      }

      // Preparar datos de actualización para el juego
      const updateData = {
        teammateEmail: teammateEmail,
        teammateUid: userUid,
        teammateName: userName,
        lastUpdated: new Date(),
      };

      // Actualizar el juego
      await updateDoc(gameRef, updateData);

      // Actualizar el perfil del usuario compañero
      await updateDoc(doc(firestore, "users", userUid), {
        reservedTheme: {
          id: gameId,
          title: data.title,
          reservedAt: new Date(),
          teamRole: "teammate",
        },
      });

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
      console.error("[useGames] Error al añadir compañero:", err);
      error.value = err instanceof Error ? err.message : "Error desconocido";
      return {
        success: false,
        error: error.value,
      };
    } finally {
      loading.value = false;
    }
  };

  // Eliminar un compañero del equipo de desarrollo
  const removeTeammate = async (gameId: string) => {
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

      // Verificar si hay un compañero asignado
      if (!data.teammateEmail || !data.teammateUid) {
        throw new Error("Este juego no tiene un compañero asignado");
      }

      // Obtener referencia al usuario compañero
      const teammateUid = data.teammateUid;
      const teammateRef = doc(firestore, "users", teammateUid);

      // Actualizar el perfil del usuario compañero para eliminar la referencia a la temática
      await updateDoc(teammateRef, {
        reservedTheme: null,
      });

      // Preparar datos de actualización para el juego
      const updateData = {
        teammateEmail: undefined,
        teammateUid: undefined,
        teammateName: undefined,
        lastUpdated: new Date(),
      };

      // Actualizar el juego
      await updateDoc(gameRef, updateData);

      // Actualizar en caché local si existe
      const index = games.value.findIndex((game) => game.id === gameId);
      if (index !== -1) {
        games.value[index] = {
          ...games.value[index],
          teammateEmail: undefined,
          teammateUid: undefined,
          teammateName: undefined,
          lastUpdated: new Date(),
        };
      }

      return { success: true };
    } catch (err) {
      console.error("[useGames] Error al eliminar compañero:", err);
      error.value = err instanceof Error ? err.message : "Error desconocido";
      return {
        success: false,
        error: error.value,
      };
    } finally {
      loading.value = false;
    }
  };

  // Actualizar información de compañeros en juegos cargados
  const updateTeammatesInfo = async () => {
    isRefreshingTeammates.value = true;
    try {
      const firestore = $firestore as Firestore;

      // Primero, intentamos actualizar los juegos cargados
      for (const game of games.value) {
        if (game.teammateEmail) {
          console.log(
            `[useGames] Buscando información del compañero para juego ${game.id}`
          );

          // Buscar información del compañero en la colección de usuarios
          const usersCollection = collection(firestore, "users");
          const q = query(
            usersCollection,
            where("email", "==", game.teammateEmail)
          );
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            // Encontramos al usuario
            const userDoc = querySnapshot.docs[0];
            const userData = userDoc.data();

            // Usar directamente displayName si existe
            if (userData.displayName) {
              console.log(
                `[useGames] Nombre del compañero encontrado: ${userData.displayName}`
              );

              // Actualizar en Firestore
              const gameRef = doc(firestore, "themes", game._docId || game.id);
              await updateDoc(gameRef, {
                teammateName: userData.displayName,
              });

              // Actualizar en memoria
              game.teammateName = userData.displayName;
              console.log(
                `[useGames] Información de compañero actualizada: ${game.teammateName}`
              );
            } else {
              // Alternativas si no hay displayName
              const fullName =
                userData.name ||
                userData.firstName ||
                (userData.firstName && userData.lastName
                  ? `${userData.firstName} ${userData.lastName}`
                  : null);

              if (fullName) {
                console.log(
                  `[useGames] Nombre alternativo encontrado: ${fullName}`
                );

                // Actualizar en Firestore
                const gameRef = doc(
                  firestore,
                  "themes",
                  game._docId || game.id
                );
                await updateDoc(gameRef, {
                  teammateName: fullName,
                });

                // Actualizar en memoria
                game.teammateName = fullName;
              } else {
                console.log(
                  `[useGames] No se encontró nombre para el usuario ${game.teammateEmail}`
                );

                // Si no hay nombre, usar la parte del usuario del email como fallback
                const username = game.teammateEmail.split("@")[0];
                const gameRef = doc(
                  firestore,
                  "themes",
                  game._docId || game.id
                );
                await updateDoc(gameRef, {
                  teammateName: username,
                });

                // Actualizar en memoria
                game.teammateName = username;
              }
            }
          } else {
            console.log(
              `[useGames] No se encontró usuario con email ${game.teammateEmail}`
            );
          }
        }
      }

      // Ahora actualizamos también todas las temáticas reservadas en Firestore
      // para asegurar que las que no están cargadas en memoria también se actualicen
      const themesCollection = collection(firestore, "themes");
      const q = query(themesCollection, where("available", "==", false));
      const querySnapshot = await getDocs(q);

      for (const themeDoc of querySnapshot.docs) {
        const theme = themeDoc.data() as Game;

        if (theme.teammateEmail) {
          console.log(`[useGames] Procesando tema reservado: ${themeDoc.id}`);

          // Buscar información del compañero
          const usersCollection = collection(firestore, "users");
          const userQuery = query(
            usersCollection,
            where("email", "==", theme.teammateEmail)
          );
          const userSnapshot = await getDocs(userQuery);

          if (!userSnapshot.empty) {
            const userData = userSnapshot.docs[0].data();

            if (userData.displayName) {
              console.log(
                `[useGames] Actualizando nombre de compañero para tema ${themeDoc.id}: ${userData.displayName}`
              );

              await updateDoc(themeDoc.ref, {
                teammateName: userData.displayName,
              });
            }
          }
        }
      }

      return true;
    } catch (err) {
      console.error(
        "[useGames] Error al actualizar información de compañeros:",
        err
      );
      return false;
    } finally {
      isRefreshingTeammates.value = false;
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

  // Obtener juegos por desarrollador (incluyendo aquellos donde es compañero)
  const getGamesByDeveloper = (userId: string) => {
    return games.value.filter(
      (game) => game.reservedById === userId || game.teammateUid === userId
    );
  };

  // Verificar si un usuario está ya en algún equipo
  const isUserInAnyTeam = async (userEmail: string) => {
    try {
      // Buscar si el usuario es propietario o compañero en algún juego
      const firestore = $firestore as Firestore;

      // Buscar si es un compañero en algún equipo
      const themesCollection = collection(firestore, "themes");
      const q = query(
        themesCollection,
        where("teammateEmail", "==", userEmail)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        return true;
      }

      // Buscar si el usuario existe y tiene una temática reservada
      const usersCollection = collection(firestore, "users");
      const userQuery = query(usersCollection, where("email", "==", userEmail));
      const userSnapshot = await getDocs(userQuery);

      if (!userSnapshot.empty) {
        const userData = userSnapshot.docs[0].data();
        if (userData.reservedTheme) {
          return true;
        }
      }

      return false;
    } catch (err) {
      console.error("[useGames] Error al verificar usuario en equipos:", err);
      return false;
    }
  };

  return {
    games,
    loading,
    error,
    isRefreshingTeammates,
    fetchAllGames,
    getGameById,
    getUserByEmail,
    updateGameStatus,
    addTeammate,
    removeTeammate,
    updateTeammatesInfo,
    getGameStats,
    gamesByStatus,
    getGamesByDeveloper,
    isUserInAnyTeam,
  };
}
