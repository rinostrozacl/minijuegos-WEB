import { getFirestore } from "firebase-admin/firestore";

/**
 * Endpoint para agregar un nuevo correo electrónico a la lista de permitidos
 * Solo accesible para administradores
 *
 * @route POST /api/admin/add-allowed-email
 * @param {Object} event - Evento HTTP
 * @returns {Object} Resultado de la operación
 */
export default defineEventHandler(async (event) => {
  try {
    // Verificar si el usuario es administrador
    const auth = event.context.auth;

    if (!auth?.user || !auth.user.email?.endsWith("@santotomas.cl")) {
      throw createError({
        statusCode: 403,
        message: "Acceso denegado. Se requieren permisos de administrador.",
      });
    }

    // Extraer datos del cuerpo de la solicitud
    const body = await readBody(event);

    if (!body?.email) {
      return {
        success: false,
        error: "Se requiere un correo electrónico",
      };
    }

    const email = body.email.toLowerCase().trim();

    // Validar formato de correo (opcional según tus requisitos)
    const emailRegex = /^[a-zA-Z0-9._-]+@(alumnos\.|)santotomas\.cl$/;
    if (!emailRegex.test(email)) {
      return {
        success: false,
        error:
          "El correo debe ser un correo institucional (@alumnos.santotomas.cl o @santotomas.cl)",
      };
    }

    // Inicializar Firestore
    const db = getFirestore();
    const collection = db.collection("allowed-emails");

    // Verificar si el correo ya existe
    const docId = email.replace(/[@.]/g, "_");
    const docRef = collection.doc(docId);
    const doc = await docRef.get();

    if (doc.exists) {
      const data = doc.data();

      // Si ya existe y está habilitado
      if (data && data.enabled === true) {
        return {
          success: true,
          message: "El correo electrónico ya está en la lista de permitidos",
          alreadyExists: true,
        };
      }

      // Si existe pero está deshabilitado, lo habilitamos
      if (data && data.enabled === false) {
        await docRef.update({
          enabled: true,
          updatedAt: new Date(),
          updatedBy: auth.user.email,
        });

        return {
          success: true,
          message:
            "El correo electrónico ha sido reactivado en la lista de permitidos",
        };
      }
    }

    // Agregar el nuevo correo
    await docRef.set({
      email: email,
      type: email.includes("@santotomas.cl") ? "admin" : "student",
      createdAt: new Date(),
      createdBy: auth.user.email,
      enabled: true,
    });

    return {
      success: true,
      message: "Correo electrónico agregado a la lista de permitidos",
    };
  } catch (error: any) {
    console.error("[API] Error al agregar correo permitido:", error);

    return {
      success: false,
      error: "Error al agregar el correo electrónico",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    };
  }
});
