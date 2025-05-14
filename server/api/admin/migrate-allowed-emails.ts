import { getFirestore } from "firebase-admin/firestore";
import { allowedEmails } from "../../data/allowed-emails";

/**
 * Endpoint para migrar la lista de correos permitidos a Firestore.
 * Solo accesible para administradores.
 *
 * @route POST /api/admin/migrate-allowed-emails
 * @param {Object} event - Evento HTTP
 * @returns {Object} Resultado de la migración
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

    // Obtener parámetros de la solicitud
    const query = getQuery(event);
    const overwrite = query.overwrite === "true";

    // Inicializar Firestore
    const db = getFirestore();
    const collection = db.collection("allowed-emails");

    // Verificar si ya existe la colección
    const snapshot = await collection.limit(1).get();

    if (!snapshot.empty && !overwrite) {
      return {
        success: false,
        error: "La colección ya existe en Firestore",
        message:
          "La colección allowed-emails ya existe. Usa overwrite=true para sobrescribirla.",
      };
    }

    // Si se solicita sobrescribir, eliminar documentos existentes
    if (overwrite) {
      const existingDocs = await collection.get();

      const deleteBatch = db.batch();
      let deleteCount = 0;

      existingDocs.forEach((doc) => {
        deleteBatch.delete(doc.ref);
        deleteCount++;
      });

      if (deleteCount > 0) {
        await deleteBatch.commit();
      }
    }

    // Crear un batch para operaciones en lote
    const batch = db.batch();

    // Contador para registros procesados
    let counter = 0;

    // Agregar cada correo al batch
    for (const email of allowedEmails) {
      const docRef = collection.doc(email.replace(/[@.]/g, "_"));

      batch.set(docRef, {
        email: email,
        type: email.includes("@santotomas.cl") ? "admin" : "student",
        createdAt: new Date(),
        enabled: true,
      });

      counter++;

      // Firestore tiene límite de 500 operaciones por batch
      if (counter % 400 === 0) {
        await batch.commit();
      }
    }

    // Commit final de las operaciones pendientes
    if (counter % 400 !== 0) {
      await batch.commit();
    }

    return {
      success: true,
      message: `Migración completada. Se migraron ${counter} correos electrónicos.`,
    };
  } catch (error: any) {
    console.error("[API] Error durante la migración de correos:", error);

    return {
      success: false,
      error: "Error durante la migración",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    };
  }
});
