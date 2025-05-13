import { getFirestore } from "firebase-admin/firestore";
import { initializeApp, getApps, cert } from "firebase-admin/app";

// Inicializar Firebase Admin si no está inicializado
if (!getApps().length) {
  try {
    const config = useRuntimeConfig();
    initializeApp({
      credential: cert({
        projectId: config.firebase.projectId,
        clientEmail: config.firebase.clientEmail,
        privateKey: config.firebase.privateKey.replace(/\\n/g, "\n"),
      }),
    });
  } catch (error) {
    console.error("Error inicializando Firebase Admin:", error);
  }
}

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { email, code } = body;

    if (!email || !code) {
      return {
        success: false,
        message: "El correo electrónico y el código son obligatorios",
      };
    }

    try {
      // Obtener el documento de verificación de Firestore
      const db = getFirestore();
      const docRef = db.collection("verification_codes").doc(email);
      const docSnap = await docRef.get();

      if (!docSnap.exists) {
        return {
          success: false,
          message:
            "No se encontró ningún código de verificación para este correo",
        };
      }

      const data = docSnap.data();

      if (!data) {
        return {
          success: false,
          message: "Error al recuperar los datos de verificación",
        };
      }

      // Verificar si ya expiró
      const now = new Date();
      const expiresAt = data.expiresAt.toDate();

      if (now > expiresAt) {
        return {
          success: false,
          message: "El código de verificación ha expirado",
        };
      }

      // Verificar si ya se verificó
      if (data.isVerified) {
        return {
          success: true,
          message: "El correo ya ha sido verificado previamente",
        };
      }

      // Incrementar intentos
      const attempts = data.attempts + 1;
      await docRef.update({ attempts });

      // Verificar máximo de intentos
      if (attempts > 3) {
        return {
          success: false,
          message: "Ha excedido el número máximo de intentos",
        };
      }

      // Verificar código
      if (data.code !== code) {
        return {
          success: false,
          message: "El código de verificación es incorrecto",
        };
      }

      // Marcar como verificado
      await docRef.update({ isVerified: true });

      return {
        success: true,
        message: "Verificación exitosa",
      };
    } catch (firestoreError) {
      console.error("Error con Firestore:", firestoreError);

      // Si estamos en desarrollo y no hay conexión a Firestore, simulamos la verificación
      // Esto es solo para fines de desarrollo, en producción debe eliminarse
      if (process.env.NODE_ENV !== "production" && code === "123456") {
        return {
          success: true,
          message: "Verificación exitosa (modo desarrollo)",
        };
      }

      return {
        success: false,
        message: "Error al verificar el código",
      };
    }
  } catch (error) {
    console.error("Error al verificar código:", error);
    return {
      success: false,
      message: "Error al verificar el código",
    };
  }
});
