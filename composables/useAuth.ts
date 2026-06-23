import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  sendEmailVerification,
  sendPasswordResetEmail,
  onAuthStateChanged,
  getAuth,
} from "firebase/auth";
import type { Auth, User, UserCredential } from "firebase/auth";
import {
  doc,
  setDoc,
  serverTimestamp,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import type { Firestore, DocumentData } from "firebase/firestore";

export const useAuth = () => {
  const { $auth, $firestore } = useNuxtApp();
  const auth = $auth as Auth;
  const firestore = $firestore as Firestore;
  const user = useState<User | null>("user", () => null);
  const isAuthenticated = computed(() => !!user.value);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const authInitialized = useState<boolean>("authInitialized", () => false);
  const isAdmin = computed(
    () => user.value?.email?.endsWith("@santotomas.cl") || false
  );

  // Comprobar si el email está verificado
  const isEmailVerified = computed(() => {
    return user.value?.emailVerified || false;
  });

  // Estado para datos adicionales del usuario
  const userData = useState<DocumentData | null>("userData", () => null);

  /**
   * Crear documento de usuario en Firestore
   * @param uid ID del usuario
   * @param userData Datos del usuario a guardar
   */
  const createUserDocument = async (uid: string, userData: any) => {
    try {
      // Crear una referencia al documento del usuario en la colección 'users'
      const userRef = doc(firestore, "users", uid);

      // Datos a guardar en Firestore
      const userDataToSave = {
        ...userData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        emailVerified: false,
        role: userData.email?.endsWith("@santotomas.cl") ? "admin" : "student",
      };

      // Guardar el documento en Firestore
      await setDoc(userRef, userDataToSave);

      console.log("Documento de usuario creado en Firestore:", uid);
      return true;
    } catch (err) {
      console.error("Error al crear documento de usuario en Firestore:", err);
      return false;
    }
  };

  /**
   * Registrar un nuevo usuario
   * @param email Email del usuario
   * @param password Contraseña
   * @param displayName Nombre a mostrar
   */
  const register = async (
    email: string,
    password: string,
    displayName: string
  ) => {
    isLoading.value = true;
    error.value = null;

    const emailNorm = email.toLowerCase().trim();

    try {
      console.log("[Auth] Iniciando registro de usuario:", emailNorm);

      // En lugar de crear directamente con Firebase Auth del cliente,
      // llamamos al endpoint del servidor que valida y crea el usuario
      const response = await $fetch("/api/auth/register", {
        method: "POST",
        body: {
          email: emailNorm,
          password,
          displayName,
        },
      });

      console.log("[Auth] Respuesta del servidor:", response);

      if (response.success) {
        // Ahora intentamos iniciar sesión con el usuario creado
        try {
          console.log(
            "[Auth] Intentando iniciar sesión con usuario recién creado"
          );
          // Intento simplificado que captura el error especifico de api-key-not-valid
          try {
            const userCredential = await signInWithEmailAndPassword(
              auth,
              emailNorm,
              password
            );

            // Actualizar el estado
            user.value = userCredential.user;

            // Cargar los datos del usuario
            try {
              await getUserData(userCredential.user.uid);
            } catch (dataError) {
              console.warn(
                "[Auth] No se pudieron cargar los datos del usuario:",
                dataError
              );
            }

            return {
              success: true,
              user: userCredential.user,
            };
          } catch (authError: any) {
            console.error(
              "[Auth] Error al iniciar sesión después del registro - Error específico:",
              authError.code || authError.message
            );

            // Detectar el error de API key inválida específicamente
            if (
              authError.code === "auth/api-key-not-valid" ||
              (authError.message &&
                authError.message.includes("api-key-not-valid"))
            ) {
              console.error(
                "[Auth] Error de API key inválida. Verificar configuración de NUXT_PUBLIC_FIREBASE_API_KEY"
              );
              return {
                success: true, // Éxito parcial: usuario creado pero no autenticado
                requireManualLogin: true,
                message: `Tu cuenta ha sido creada exitosamente con el email ${emailNorm}. Por favor, inicia sesión manualmente.`,
                error:
                  "Error de configuración. El usuario ha sido creado pero no se pudo iniciar sesión automáticamente.",
              };
            }

            // Otros errores de autenticación
            return {
              success: true,
              message: `Tu cuenta ha sido creada exitosamente con el email ${emailNorm}. Por favor, inicia sesión manualmente.`,
              requireManualLogin: true,
              error:
                authError.message ||
                "Error al iniciar sesión después del registro",
            };
          }
        } catch (loginError: any) {
          console.error(
            "[Auth] Error general al iniciar sesión después del registro:",
            loginError
          );
          // Aunque hubo error al iniciar sesión, el usuario fue creado
          return {
            success: true,
            message: `Tu cuenta ha sido creada exitosamente con el email ${emailNorm}. Por favor, inicia sesión manualmente.`,
            requireManualLogin: true,
            error: loginError.message || "Error desconocido al iniciar sesión",
          };
        }
      } else {
        // Si el servidor devuelve un error, lo propagamos
        error.value = response.message || "Error desconocido al registrar";
        console.error(
          "[Auth] Error de registro desde el servidor:",
          response.message
        );
        return {
          success: false,
          error: response.message || "Error desconocido al registrar",
        };
      }
    } catch (err: any) {
      console.error("[Auth] Error al registrar usuario:", err);

      // Manejar diferentes tipos de errores
      if (err.name === "FetchError") {
        error.value =
          "Error de conexión con el servidor. Verifica tu conexión a internet.";
      } else if (err.message && err.message.includes("api-key-not-valid")) {
        error.value =
          "Error de configuración de Firebase. El usuario ha sido creado pero no se pudo iniciar sesión automáticamente. Por favor, intenta iniciar sesión manualmente.";
        console.error(
          "[Auth] Error de API key inválida. Verificar configuración de Firebase. El usuario puede estar creado pero hay que iniciar sesión manualmente."
        );
        return {
          success: true, // Considerar éxito parcial
          requireManualLogin: true,
          error: error.value,
        };
      } else {
        error.value = err.message || "Error desconocido al registrar";
      }

      return {
        success: false,
        error: error.value,
      };
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Obtener datos del usuario desde Firestore
   * @param uid ID del usuario
   */
  const getUserData = async (uid: string) => {
    try {
      const userRef = doc(firestore, "users", uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        // Actualizar el estado con los datos del usuario
        userData.value = userSnap.data();
        return userSnap.data();
      } else {
        console.log("No se encontró documento para el usuario:", uid);
        return null;
      }
    } catch (err) {
      console.error("Error al obtener datos del usuario:", err);
      return null;
    }
  };

  /**
   * Iniciar sesión
   * @param email Email del usuario
   * @param password Contraseña
   */
  const login = async (email: string, password: string) => {
    isLoading.value = true;
    error.value = null;

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      user.value = userCredential.user;

      // Cargar datos adicionales del usuario desde Firestore
      await getUserData(userCredential.user.uid);

      return {
        success: true,
        user: userCredential.user,
      };
    } catch (err: any) {
      console.error("Error al iniciar sesión:", err);
      error.value = err.message;
      return {
        success: false,
        error: err.message,
      };
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Cerrar sesión
   */
  const logout = async () => {
    console.log("[useAuth] Intentando cerrar sesión...");
    try {
      if (!auth) {
        console.error("[useAuth] Error: auth es nulo o indefinido");
        throw new Error("Auth service not available");
      }
      console.log("[useAuth] Llamando a Firebase Auth signOut...");
      await signOut(auth);
      console.log("[useAuth] Firebase Auth signOut completado");
      user.value = null;
      userData.value = null; // Limpiar datos adicionales del usuario
      console.log("[useAuth] Estado de usuario limpiado");
      return { success: true };
    } catch (err: any) {
      console.error("[useAuth] Error al cerrar sesión:", err);
      return {
        success: false,
        error: err.message,
      };
    }
  };

  /**
   * Enviar email de verificación
   * @returns Resultado de la operación
   */
  const sendVerificationEmail = async () => {
    if (!user.value) {
      return {
        success: false,
        error: "Usuario no autenticado",
      };
    }

    try {
      await sendEmailVerification(user.value);
      return { success: true };
    } catch (err: any) {
      console.error("Error al enviar email de verificación:", err);
      return {
        success: false,
        error: err.message,
      };
    }
  };

  /**
   * Enviar email para restablecer contraseña
   * @param email Email del usuario
   */
  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (err: any) {
      console.error("Error al enviar email de restablecimiento:", err);
      return {
        success: false,
        error: err.message,
      };
    }
  };

  /**
   * Actualizar el estado emailVerified del usuario
   */
  const updateEmailVerificationStatus = async () => {
    if (!user.value) return false;

    try {
      // Recargar el usuario para obtener el estado actualizado
      await user.value.reload();
      user.value = auth.currentUser;

      // Actualizar también en Firestore
      if (user.value && user.value.emailVerified) {
        const userRef = doc(firestore, "users", user.value.uid);
        await updateDoc(userRef, {
          emailVerified: true,
          updatedAt: serverTimestamp(),
        });

        // Actualizar datos locales
        if (userData.value) {
          userData.value.emailVerified = true;
        }
      }

      return user.value?.emailVerified || false;
    } catch (err) {
      console.error("Error al actualizar estado de verificación:", err);
      return false;
    }
  };

  /**
   * Refrescar el estado del usuario (recargar desde Firebase)
   */
  const refreshUserState = async () => {
    if (!user.value) return false;

    try {
      await user.value.reload();
      user.value = auth.currentUser;

      // Recargar datos de Firestore también
      if (user.value) {
        await getUserData(user.value.uid);
      }

      return true;
    } catch (err) {
      console.error("Error al refrescar estado del usuario:", err);
      return false;
    }
  };

  /**
   * Actualizar perfil de usuario
   * @param userData Datos del perfil a actualizar
   */
  const updateUserProfile = async (userData: {
    displayName?: string;
    photoURL?: string;
    [key: string]: any;
  }) => {
    if (!user.value) {
      return {
        success: false,
        error: "Usuario no autenticado",
      };
    }

    isLoading.value = true;
    error.value = null;

    try {
      // Datos que se pueden actualizar en Firebase Auth
      const authUpdateData: {
        displayName?: string;
        photoURL?: string;
      } = {};

      if (userData.displayName)
        authUpdateData.displayName = userData.displayName;
      if (userData.photoURL) authUpdateData.photoURL = userData.photoURL;

      // Actualizar perfil en Firebase Auth
      if (Object.keys(authUpdateData).length > 0) {
        await updateProfile(user.value, authUpdateData);
      }

      // Actualizar documento en Firestore
      const userRef = doc(firestore, "users", user.value.uid);
      await updateDoc(userRef, {
        ...userData,
        updatedAt: serverTimestamp(),
      });

      return {
        success: true,
      };
    } catch (err: any) {
      console.error("Error al actualizar perfil:", err);
      error.value = err.message;
      return {
        success: false,
        error: err.message,
      };
    } finally {
      isLoading.value = false;
    }
  };

  // Método para verificar si la autenticación está lista
  const waitForAuthInitialized = () => {
    return new Promise<void>((resolve) => {
      // Si ya está inicializado, resolver inmediatamente
      if (authInitialized.value) {
        console.log(
          "[useAuth] Auth ya está inicializado, resolviendo inmediatamente"
        );
        resolve();
        return;
      }

      console.log("[useAuth] Esperando inicialización de autenticación...");

      // Verificar disponibilidad de los servicios primero
      if (!auth) {
        console.error(
          "[useAuth] El servicio de autenticación no está disponible"
        );
        authInitialized.value = true;
        resolve();
        return;
      }

      // Verificar periódicamente hasta que se inicialice
      const checkInterval = setInterval(() => {
        if (authInitialized.value) {
          console.log(
            "[useAuth] Auth inicializado detectado, resolviendo promesa"
          );
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);

      // Timeout de seguridad después de 5 segundos
      setTimeout(() => {
        clearInterval(checkInterval);
        // Marcar como inicializado aunque no lo esté para evitar bloqueos
        if (!authInitialized.value) {
          console.warn(
            "[useAuth] Timeout de espera de inicialización de auth, forzando resolución"
          );
          authInitialized.value = true;
        }
        resolve();
      }, 5000);
    });
  };

  /** Token fresco para APIs del servidor (renueva si expiró). */
  const getFreshIdToken = async (): Promise<string> => {
    if (!auth?.currentUser) {
      throw new Error("Sesión requerida");
    }
    return auth.currentUser.getIdToken(true);
  };

  return {
    user,
    userData,
    isAuthenticated,
    isLoading,
    error,
    isAdmin,
    isEmailVerified,
    authInitialized,
    waitForAuthInitialized,
    getFreshIdToken,
    register,
    login,
    logout,
    sendVerificationEmail,
    resetPassword,
    refreshUserState,
    createUserDocument,
    updateEmailVerificationStatus,
    updateUserProfile,
    getUserData,
  };
};
