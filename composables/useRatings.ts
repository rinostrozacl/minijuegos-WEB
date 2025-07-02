import { ref, computed } from "vue";
import {
  collection,
  doc,
  addDoc,
  query,
  where,
  getDocs,
  orderBy,
  serverTimestamp,
  Firestore,
} from "firebase/firestore";

interface RatingData {
  gameId: string;
  userId?: string; // opcional si hay autenticación
  email: string;
  rating: number; // 1-5 estrellas
  playTime: number; // en segundos
  finalScore: number; // puntaje calculado

  // Tracking de usuario
  fingerprint: string;
  ipAddress?: string;
  userAgent: string;
  platform: string;
  device: string;
  geolocation?: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };

  // Metadata
  timestamp: any; // serverTimestamp
  gameUrl: string;
  sessionId: string;
}

export const useRatings = () => {
  const { $firestore } = useNuxtApp();
  const firestore = $firestore as Firestore;
  const isSubmitting = ref(false);
  const hasRated = ref(false);
  const userRating = ref<RatingData | null>(null);

  // Estados para el tracking
  const startTime = ref<Date | null>(null);
  const currentPlayTime = ref(0);
  const playTimeInterval = ref<NodeJS.Timeout | null>(null);

  // Canvas Fingerprinting
  const generateCanvasFingerprint = (): string => {
    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) return "no-canvas-support";

      canvas.width = 200;
      canvas.height = 50;

      // Dibujar texto con diferentes fuentes y propiedades
      ctx.textBaseline = "top";
      ctx.font = "14px 'Arial'";
      ctx.fillStyle = "#f60";
      ctx.fillRect(125, 1, 62, 20);

      ctx.fillStyle = "#069";
      ctx.fillText("GameCraft2025 🎮", 2, 15);

      ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
      ctx.fillText("Canvas fingerprint", 4, 45);

      // Obtener datos del canvas
      const canvasData = canvas.toDataURL();

      // Crear hash simple del canvas
      let hash = 0;
      for (let i = 0; i < canvasData.length; i++) {
        const char = canvasData.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash; // Convertir a 32bit integer
      }

      return Math.abs(hash).toString(16);
    } catch (error) {
      console.error("Error generating canvas fingerprint:", error);
      return "fingerprint-error";
    }
  };

  // Detectar información del dispositivo
  const getDeviceInfo = () => {
    const userAgent = navigator.userAgent;

    let platform = "unknown";
    let device = "desktop";

    // Detectar plataforma
    if (userAgent.includes("Windows")) platform = "Windows";
    else if (userAgent.includes("Mac")) platform = "macOS";
    else if (userAgent.includes("Linux")) platform = "Linux";
    else if (userAgent.includes("Android")) platform = "Android";
    else if (
      userAgent.includes("iOS") ||
      userAgent.includes("iPhone") ||
      userAgent.includes("iPad")
    )
      platform = "iOS";

    // Detectar tipo de dispositivo
    if (
      /Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        userAgent
      )
    ) {
      device = "mobile";
    } else if (/Tablet|iPad/i.test(userAgent)) {
      device = "tablet";
    }

    return { platform, device, userAgent };
  };

  // Obtener geolocalización
  const getGeolocation = (): Promise<GeolocationPosition | null> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => resolve(position),
        (error) => {
          console.warn("Geolocation error:", error);
          resolve(null);
        },
        {
          enableHighAccuracy: false,
          timeout: 5000,
          maximumAge: 300000, // 5 minutos
        }
      );
    });
  };

  // Generar ID de sesión único
  const generateSessionId = (): string => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  };

  // Iniciar tracking de tiempo de juego
  const startGameTracking = () => {
    if (startTime.value) return; // Ya está iniciado

    startTime.value = new Date();
    currentPlayTime.value = 0;

    // Actualizar el tiempo cada segundo
    playTimeInterval.value = setInterval(() => {
      if (startTime.value) {
        currentPlayTime.value = Math.floor(
          (Date.now() - startTime.value.getTime()) / 1000
        );
      }
    }, 1000);

    console.log("[Ratings] Tracking de tiempo iniciado");
  };

  // Detener tracking de tiempo
  const stopGameTracking = () => {
    if (playTimeInterval.value) {
      clearInterval(playTimeInterval.value);
      playTimeInterval.value = null;
    }
    console.log(
      `[Ratings] Tracking detenido. Tiempo total: ${currentPlayTime.value}s`
    );
  };

  // Calcular puntaje final basado en tiempo jugado
  const calculateFinalScore = (
    rating: number,
    playTimeSeconds: number
  ): number => {
    const minRequiredTime = 180; // 3 minutos en segundos

    if (playTimeSeconds >= minRequiredTime) {
      return rating; // Puntaje completo
    }

    // Puntaje proporcional
    const proportion = playTimeSeconds / minRequiredTime;
    return Math.round(rating * proportion * 10) / 10; // Redondear a 1 decimal
  };

  // Verificar si el usuario ya calificó este juego
  const checkExistingRating = async (
    gameId: string,
    email: string
  ): Promise<RatingData | null> => {
    try {
      if (!firestore) return null;

      const ratingsRef = collection(firestore, "ratings");
      const q = query(
        ratingsRef,
        where("gameId", "==", gameId),
        where("email", "==", email)
      );

      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        const data = doc.data() as RatingData;
        return { ...data, id: doc.id } as RatingData & { id: string };
      }

      return null;
    } catch (error) {
      console.error("[Ratings] Error checking existing rating:", error);
      return null;
    }
  };

  // Obtener IP del usuario (desde el servidor)
  const getUserIP = async (): Promise<string | undefined> => {
    try {
      const response = (await $fetch("/api/user-info")) as { ip?: string };
      return response.ip;
    } catch (error) {
      console.warn("[Ratings] No se pudo obtener IP:", error);
      return undefined;
    }
  };

  // Enviar calificación
  const submitRating = async (
    gameId: string,
    email: string,
    rating: number
  ): Promise<boolean> => {
    try {
      if (!$firestore) {
        throw new Error("Firestore no está disponible");
      }

      if (rating < 1 || rating > 5) {
        throw new Error("La calificación debe ser entre 1 y 5 estrellas");
      }

      isSubmitting.value = true;

      // Verificar si ya calificó
      const existingRating = await checkExistingRating(gameId, email);
      if (existingRating) {
        throw new Error("Ya has calificado este juego anteriormente");
      }

      // Recopilar toda la información
      const playTimeSeconds = currentPlayTime.value;
      const finalScore = calculateFinalScore(rating, playTimeSeconds);
      const deviceInfo = getDeviceInfo();
      const fingerprint = generateCanvasFingerprint();
      const sessionId = generateSessionId();
      const ipAddress = await getUserIP();
      const geolocation = await getGeolocation();

      const ratingData: Omit<RatingData, "id"> = {
        gameId,
        email,
        rating,
        playTime: playTimeSeconds,
        finalScore,
        fingerprint,
        ipAddress,
        userAgent: deviceInfo.userAgent,
        platform: deviceInfo.platform,
        device: deviceInfo.device,
        geolocation: geolocation
          ? {
              latitude: geolocation.coords.latitude,
              longitude: geolocation.coords.longitude,
              accuracy: geolocation.coords.accuracy,
            }
          : undefined,
        timestamp: serverTimestamp(),
        gameUrl: window.location.href,
        sessionId,
      };

      // Guardar en Firestore
      const ratingsRef = collection(firestore, "ratings");
      const docRef = await addDoc(ratingsRef, ratingData);

      console.log(`[Ratings] Calificación guardada con ID: ${docRef.id}`);
      console.log(
        `[Ratings] Puntaje: ${rating} estrellas, Tiempo: ${playTimeSeconds}s, Puntaje final: ${finalScore}`
      );

      hasRated.value = true;
      userRating.value = { ...ratingData, id: docRef.id } as RatingData & {
        id: string;
      };

      return true;
    } catch (error) {
      console.error("[Ratings] Error al enviar calificación:", error);
      throw error;
    } finally {
      isSubmitting.value = false;
    }
  };

  // Obtener todas las calificaciones de un juego (solo para admins)
  const getGameRatings = async (gameId: string) => {
    try {
      if (!firestore) return [];

      const ratingsRef = collection(firestore, "ratings");
      const q = query(
        ratingsRef,
        where("gameId", "==", gameId),
        orderBy("timestamp", "desc")
      );

      const querySnapshot = await getDocs(q);
      const ratings = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as (RatingData & { id: string })[];

      return ratings;
    } catch (error) {
      console.error("[Ratings] Error getting game ratings:", error);
      return [];
    }
  };

  // Calcular estadísticas de un juego
  const getGameStats = async (gameId: string) => {
    try {
      const ratings = await getGameRatings(gameId);

      if (ratings.length === 0) {
        return {
          totalRatings: 0,
          averageRating: 0,
          averageFinalScore: 0,
          averagePlayTime: 0,
          ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        };
      }

      const totalRatings = ratings.length;
      const averageRating =
        ratings.reduce((sum, r) => sum + r.rating, 0) / totalRatings;
      const averageFinalScore =
        ratings.reduce((sum, r) => sum + r.finalScore, 0) / totalRatings;
      const averagePlayTime =
        ratings.reduce((sum, r) => sum + r.playTime, 0) / totalRatings;

      const ratingDistribution = ratings.reduce(
        (dist, r) => {
          dist[r.rating as keyof typeof dist]++;
          return dist;
        },
        { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      );

      return {
        totalRatings,
        averageRating: Math.round(averageRating * 10) / 10,
        averageFinalScore: Math.round(averageFinalScore * 10) / 10,
        averagePlayTime: Math.round(averagePlayTime),
        ratingDistribution,
      };
    } catch (error) {
      console.error("[Ratings] Error calculating game stats:", error);
      return null;
    }
  };

  // Tiempo formateado para mostrar al usuario
  const formattedPlayTime = computed(() => {
    const minutes = Math.floor(currentPlayTime.value / 60);
    const seconds = currentPlayTime.value % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  });

  // Cleanup al destruir el componente
  const cleanup = () => {
    stopGameTracking();
  };

  return {
    // Estados
    isSubmitting,
    hasRated,
    userRating,
    currentPlayTime,
    formattedPlayTime,

    // Métodos principales
    startGameTracking,
    stopGameTracking,
    submitRating,
    checkExistingRating,

    // Métodos para administradores
    getGameRatings,
    getGameStats,

    // Utilidades
    calculateFinalScore,
    generateCanvasFingerprint,
    cleanup,
  };
};
