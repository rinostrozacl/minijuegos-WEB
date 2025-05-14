import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { allowedEmails } from "../data/allowed-emails";
import path from "path";
import fs from "fs";

// Función principal para la migración
async function migrateAllowedEmailsToFirebase() {
  console.log("Iniciando migración de correos permitidos a Firebase...");

  try {
    // Inicializar Firebase Admin
    const serviceAccountPath = path.resolve(
      process.cwd(),
      "minijuegos-firebasekey.json"
    );

    if (!fs.existsSync(serviceAccountPath)) {
      throw new Error(
        `No se encontró el archivo de credenciales en: ${serviceAccountPath}`
      );
    }

    // Inicializar aplicación Firebase si no está inicializada
    let app;
    try {
      app = initializeApp(
        {
          credential: cert(serviceAccountPath),
        },
        "migrate-allowed-emails"
      );
    } catch (error) {
      console.log("Usando la aplicación de Firebase existente");
    }

    // Obtener instancia de Firestore
    const db = getFirestore();
    const collection = db.collection("allowed-emails");

    // Crear un batch para operaciones en lote
    const batch = db.batch();

    // Contador para registros procesados
    let counter = 0;

    // Verificar si ya existe la colección
    const snapshot = await collection.limit(1).get();

    if (!snapshot.empty) {
      const overwrite = process.argv.includes("--overwrite");

      if (!overwrite) {
        console.log("⚠️ La colección allowed-emails ya existe en Firestore.");
        console.log(
          "Si deseas sobrescribirla, ejecuta el script con el argumento --overwrite"
        );
        return;
      } else {
        console.log("Sobrescribiendo colección existente...");

        // Eliminar documentos existentes
        const existingDocs = await collection.get();

        const deleteBatch = db.batch();
        existingDocs.forEach((doc) => {
          deleteBatch.delete(doc.ref);
        });

        await deleteBatch.commit();
        console.log(`Eliminados ${existingDocs.size} documentos existentes.`);
      }
    }

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
        console.log(`Procesados ${counter} correos...`);
      }
    }

    // Commit final de las operaciones pendientes
    if (counter % 400 !== 0) {
      await batch.commit();
    }

    console.log(
      `✅ Migración completada. Se migraron ${counter} correos electrónicos.`
    );
  } catch (error) {
    console.error("Error durante la migración:", error);
    process.exit(1);
  }
}

// Ejecutar la migración
migrateAllowedEmailsToFirebase()
  .then(() => {
    console.log("Proceso de migración finalizado.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Error inesperado:", err);
    process.exit(1);
  });
