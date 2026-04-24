import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getFirebaseAdminStatus } from "../../plugins/firebase-admin";
import { isRegistrationEmailFormatAllowed } from "~/utils/registration-email";

/**
 * Endpoint para el registro de usuarios
 * Realiza la validación del correo directamente en Firestore y crea el usuario en Firebase si está permitido
 */
export default defineEventHandler(async (event) => {
  console.log("[API:register] Iniciando proceso de registro");

  try {
    const body = await readBody(event);
    const { email, password, displayName } = body;

    console.log(
      `[API:register] Datos recibidos: email=${email}, displayName=${displayName}`
    );

    // Validar campos requeridos
    if (!email || !password || !displayName) {
      console.log("[API:register] Error: Campos incompletos");
      return {
        success: false,
        message: "Se requieren todos los campos: email, password y displayName",
      };
    }

    const emailLowerCase =
      typeof email === "string" ? email.toLowerCase().trim() : "";

    // Validar formato de correo (institucional o allowlist de pruebas)
    if (!isRegistrationEmailFormatAllowed(emailLowerCase)) {
      console.log(
        `[API:register] Error: Formato de correo inválido - ${emailLowerCase}`
      );
      return {
        success: false,
        message:
          "El correo debe ser institucional (@alumnos.santotomas.cl o @santotomas.cl) o un correo autorizado para pruebas",
      };
    }

    // Verificar estado de Firebase Admin
    const adminStatus = getFirebaseAdminStatus();
    console.log("[API:register] Estado de Firebase Admin:", adminStatus);

    // Verificar si el correo está en la lista de permitidos consultando directamente Firestore
    try {
      console.log("[API:register] Obteniendo instancia de Firestore");
      const db = getFirestore();

      console.log(`[API:register] Verificando correo: ${emailLowerCase}`);

      // Primera estrategia: buscar por ID (convertido)
      const docId = emailLowerCase.replace(/[@.]/g, "_");
      const docRef = db.collection("allowed-emails").doc(docId);

      console.log(`[API:register] Buscando documento con ID: ${docId}`);
      const doc = await docRef.get();

      let isAllowed = false;
      let userType = "student";

      if (doc.exists) {
        console.log(`[API:register] Documento encontrado por ID: ${docId}`);
        const data = doc.data();
        // Verificar si el correo está habilitado
        if (data && data.enabled === true) {
          isAllowed = true;
          userType = data.type || "student";
          console.log(`[API:register] Correo permitido. Tipo: ${userType}`);
        } else {
          console.log(`[API:register] Correo encontrado pero deshabilitado`);
        }
      } else {
        // Segunda estrategia: buscar por campo email
        console.log(
          `[API:register] Documento no encontrado por ID, buscando por campo email`
        );
        const querySnapshot = await db
          .collection("allowed-emails")
          .where("email", "==", emailLowerCase)
          .where("enabled", "==", true)
          .limit(1)
          .get();

        if (!querySnapshot.empty) {
          console.log(`[API:register] Correo encontrado por consulta`);
          const data = querySnapshot.docs[0].data();
          isAllowed = true;
          userType = data.type || "student";
          console.log(`[API:register] Correo permitido. Tipo: ${userType}`);
        } else {
          console.log(`[API:register] Correo no encontrado o no habilitado`);
        }
      }

      if (!isAllowed) {
        console.log(`[API:register] Acceso denegado para: ${emailLowerCase}`);
        return {
          success: false,
          message:
            "Este correo no está autorizado para registrarse en la plataforma",
          reason: "email_not_allowed",
        };
      }
    } catch (firestoreError) {
      console.error(
        "[API:register] Error al verificar correo en Firestore:",
        firestoreError
      );
      return {
        success: false,
        message: "Error al verificar el correo. Inténtalo de nuevo más tarde.",
      };
    }

    // El registro solo procede si el correo fue verificado con el OTP (mismo id de doc que generate)
    try {
      const dbOtp = getFirestore();
      const verSnap = await dbOtp
        .collection("verification_codes")
        .doc(emailLowerCase)
        .get();

      if (!verSnap.exists) {
        console.log(
          `[API:register] Sin documento verification_codes para: ${emailLowerCase}`
        );
        return {
          success: false,
          message:
            "No hay verificación de correo activa. Solicita un código desde el registro e introdúcelo antes de continuar.",
          reason: "verification_missing",
        };
      }

      const otpData = verSnap.data();
      if (!otpData?.isVerified) {
        console.log(
          `[API:register] Código de correo no verificado para: ${emailLowerCase}`
        );
        return {
          success: false,
          message:
            "Debes verificar tu correo con el código enviado antes de completar el registro.",
          reason: "verification_not_completed",
        };
      }
    } catch (otpError) {
      console.error(
        "[API:register] Error al comprobar verification_codes:",
        otpError
      );
      return {
        success: false,
        message:
          "No se pudo validar la verificación del correo. Inténtalo de nuevo más tarde.",
      };
    }

    // Crear usuario en Firebase Auth
    console.log("[API:register] Obteniendo instancia de Auth");
    const auth = getAuth();
    try {
      console.log(`[API:register] Creando usuario: ${emailLowerCase}`);
      const userRecord = await auth.createUser({
        email: emailLowerCase,
        password,
        displayName,
        emailVerified: true,
      });

      console.log(
        `[API:register] Usuario creado exitosamente. UID: ${userRecord.uid}`
      );

      // Crear documento del usuario en Firestore
      try {
        console.log(
          `[API:register] Creando documento en Firestore para usuario: ${userRecord.uid}`
        );
        const db = getFirestore();
        const userDocRef = db.collection("users").doc(userRecord.uid);

        // Determinar rol basado en el dominio del correo
        const isAdmin = emailLowerCase.endsWith("@santotomas.cl");
        const role = isAdmin ? "admin" : "student";

        // Crear el documento con los datos básicos
        await userDocRef.set({
          email: emailLowerCase,
          displayName,
          photoURL: userRecord.photoURL || null,
          emailVerified: true,
          role,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        console.log(
          `[API:register] Documento creado exitosamente en Firestore`
        );
      } catch (firestoreError) {
        console.error(
          "[API:register] Error al crear documento en Firestore:",
          firestoreError
        );
        // No fallamos el registro por esto, ya que el usuario ya está creado en Auth
      }

      return {
        success: true,
        message: "Usuario registrado exitosamente",
        user: {
          uid: userRecord.uid,
          email: userRecord.email,
          displayName: userRecord.displayName,
        },
      };
    } catch (error: any) {
      console.error(
        "[API:register] Error al crear usuario en Firebase:",
        error
      );

      // Manejar errores específicos de Firebase
      if (error.code === "auth/email-already-exists") {
        return {
          success: false,
          message: "Este correo electrónico ya está registrado",
        };
      }

      return {
        success: false,
        message: "Error al crear usuario. Inténtalo de nuevo más tarde.",
      };
    }
  } catch (error) {
    console.error("[API:register] Error general en el registro:", error);
    return {
      success: false,
      message: "Error del servidor al procesar la solicitud",
    };
  }
});
