import { onAuthStateChanged } from "firebase/auth";
import type { Auth, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import type { Firestore, DocumentData } from "firebase/firestore";

export default defineNuxtPlugin(async (nuxtApp) => {
  const { $auth, $firestore } = nuxtApp;
  const user = useState<User | null>("user", () => null);
  const userData = useState<DocumentData | null>("userData", () => null);
  const authInitialized = useState<boolean>("authInitialized", () => false);

  console.log("[Auth Plugin] Inicializando plugin de autenticación");

  // Verificar si tenemos servicios Firebase disponibles
  if (!$auth || !$firestore) {
    console.error(
      "[Auth Plugin] Error: Servicios de Firebase no están disponibles - comprueba el plugin de Firebase"
    );
    // Marcar como inicializado para evitar bloqueos
    authInitialized.value = true;
    return {
      provide: {
        authInitialized: authInitialized,
      },
    };
  }

  // Asignar tipos seguros después de verificar que existen
  const auth = $auth as Auth;
  const firestore = $firestore as Firestore;

  // Función para cargar datos del usuario desde Firestore
  const loadUserData = async (userId: string) => {
    try {
      const userDocRef = doc(firestore, "users", userId);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        userData.value = userDoc.data();
        console.log("[Auth Plugin] Datos de usuario cargados desde Firestore");
      } else {
        console.log(
          "[Auth Plugin] No se encontró documento para el usuario:",
          userId
        );
        userData.value = null;
      }
    } catch (error) {
      console.error("[Auth Plugin] Error al cargar datos del usuario:", error);
      userData.value = null;
    }
  };

  console.log("[Auth Plugin] Configurando listener de autenticación...");

  // Configuramos una promesa para resolver cuando el estado inicial de auth se conozca
  const authStatePromise = new Promise<void>((resolve) => {
    try {
      // Configuramos un listener para cambios en el estado de autenticación
      const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
        console.log(
          "[Auth Plugin] Estado de autenticación cambiado:",
          authUser ? `Usuario autenticado: ${authUser.email}` : "No autenticado"
        );

        // Actualizar estado global del usuario
        user.value = authUser;

        // Si hay usuario autenticado, cargar sus datos adicionales
        if (authUser) {
          await loadUserData(authUser.uid);
        } else {
          userData.value = null;
        }

        // Marcar la autenticación como inicializada
        if (!authInitialized.value) {
          authInitialized.value = true;
          console.log("[Auth Plugin] Autenticación inicializada");
          resolve(); // Resolvemos la promesa ahora que tenemos el estado inicial
        }

        // Redirigir a la página guardada si se ha iniciado sesión después de ser redirigido
        if (authUser) {
          const route = useRoute();
          const router = useRouter();

          if (route.query.redirect) {
            const redirectPath = route.query.redirect as string;
            if (route.path === "/ingresar") {
              console.log("[Auth Plugin] Redirigiendo a:", redirectPath);
              router.push(redirectPath);
            }
          }
        }
      });

      // Asegurarnos de que se marque como inicializado incluso si hay un problema
      setTimeout(() => {
        if (!authInitialized.value) {
          console.warn(
            "[Auth Plugin] Tiempo de espera agotado para la inicialización de autenticación"
          );
          authInitialized.value = true;
          resolve();
        }
      }, 5000);
    } catch (error) {
      console.error(
        "[Auth Plugin] Error al configurar onAuthStateChanged:",
        error
      );
      authInitialized.value = true;
      resolve();
    }
  });

  // Esperar a que se inicialice antes de continuar
  await authStatePromise;

  return {
    provide: {
      authInitialized: authInitialized,
    },
  };
});
