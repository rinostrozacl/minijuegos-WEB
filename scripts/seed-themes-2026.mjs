/**
 * Carga las 30 temáticas mitológicas GameCraft2026 en Firestore (colección `themes`).
 *
 * Requisitos:
 * - GOOGLE_APPLICATION_CREDENTIALS = ruta a JSON de cuenta de servicio con acceso a Firestore.
 * - Opcional: FIREBASE_PROJECT_ID
 *
 * Uso (desde la raíz del repo):
 *   node scripts/seed-themes-2026.mjs
 *   node scripts/seed-themes-2026.mjs --reset-available
 *
 * Sin --reset-available: crea/actualiza título, descripción y tags; si el documento
 * no existía, marca available=true. No borra reservas existentes.
 * Con --reset-available: además libera todas las reservas y deja available=true.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { initializeApp, applicationDefault } from "firebase-admin/app";
import { FieldValue, getFirestore } from "firebase-admin/firestore";

const __dirname = dirname(fileURLToPath(import.meta.url));
const resetAvailable = process.argv.includes("--reset-available");

const dataPath = join(__dirname, "../data/themes-gamecraft-2026.json");
const rows = JSON.parse(readFileSync(dataPath, "utf8"));

initializeApp({
  credential: applicationDefault(),
  projectId: process.env.FIREBASE_PROJECT_ID,
});

const db = getFirestore();

async function main() {
  console.log(`Sembrando ${rows.length} temáticas en themes/...`);
  for (const row of rows) {
    const id = String(row.numero);
    const ref = db.collection("themes").doc(id);
    const snap = await ref.get();

    const payload = {
      id,
      numero: row.numero,
      title: row.title,
      description: row.description,
      tags: row.tags,
      createdAt: FieldValue.serverTimestamp(),
    };

    if (resetAvailable) {
      payload.available = true;
      payload.reservedBy = FieldValue.delete();
      payload.reservedById = FieldValue.delete();
      payload.reservedAt = FieldValue.delete();
      payload.teammateEmail = FieldValue.delete();
      payload.teammateName = FieldValue.delete();
    } else if (!snap.exists) {
      payload.available = true;
    }

    await ref.set(payload, { merge: true });
    console.log(`  OK themes/${id} — ${row.title}`);
  }
  console.log("Listo.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
