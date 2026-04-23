import { getFirestoreDb } from "../../plugins/firebase-admin";
import { sendVerificationEmail } from "../../utils/email";
import { isRegistrationEmailFormatAllowed } from "~/utils/registration-email";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { email: rawEmail } = body;
    const email =
      typeof rawEmail === "string" ? rawEmail.toLowerCase().trim() : "";

    if (!email) {
      return {
        success: false,
        message: "El correo electrónico es obligatorio",
      };
    }

    if (!isRegistrationEmailFormatAllowed(email)) {
      return {
        success: false,
        message:
          "Debe ser un correo institucional (@alumnos.santotomas.cl o @santotomas.cl) o un correo autorizado para pruebas",
      };
    }

    // Generar código aleatorio de 6 dígitos
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Calcular fecha de expiración (15 minutos)
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 15 * 60 * 1000);

    const db = getFirestoreDb();
    const verificationDocRef = db.collection("verification_codes").doc(email);

    // Crear documento de verificación en Firestore
    try {
      await verificationDocRef.set({
        email,
        code,
        attempts: 0,
        isVerified: false,
        createdAt: now,
        expiresAt,
      });
    } catch (firestoreError) {
      console.error("Error con Firestore:", firestoreError);
      return {
        success: false,
        message: "Error al guardar el código de verificación",
      };
    }

    // Enviar email con el código utilizando la función de utilidad
    const emailResult = await sendVerificationEmail(email, code);

    if (!emailResult.success) {
      try {
        await verificationDocRef.delete();
      } catch (delErr) {
        console.warn("[verification/generate] No se pudo borrar código tras fallo Resend:", delErr);
      }
      const errMsg =
        typeof emailResult.error === "string"
          ? emailResult.error
          : "No se pudo enviar el correo. Revisa dominio y API de Resend (RESEND_FROM_EMAIL, RESEND_API_KEY).";
      return {
        success: false,
        message: errMsg,
      };
    }

    return {
      success: true,
      message: "Código de verificación enviado correctamente",
    };
  } catch (error) {
    console.error("Error al generar código de verificación:", error);
    return {
      success: false,
      message: "Error al generar el código de verificación",
    };
  }
});
