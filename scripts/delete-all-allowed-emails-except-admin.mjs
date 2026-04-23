/**
 * Deja en Firestore `allowed-emails` solo el correo del administrador.
 * Asegura un documento canónico (mismo id que usa el API: email con @ y . → _).
 *
 * Uso: node scripts/delete-all-allowed-emails-except-admin.mjs
 */
import { createRequire } from "module";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

const KEEP_EMAIL = "ricardoinostrozare@santotomas.cl";
const keepLower = KEEP_EMAIL.toLowerCase().trim();
const CANONICAL_DOC_ID = keepLower.replace(/[@.]/g, "_");

const admin = require("firebase-admin");
const keyPath = path.resolve(__dirname, "..", "minijuegos-firebasekey.json");

admin.initializeApp({
  credential: admin.credential.cert(keyPath),
});

function normEmail(data) {
  const e = data?.email;
  if (typeof e !== "string") return "";
  return e.toLowerCase().trim();
}

async function main() {
  const db = admin.firestore();
  const col = db.collection("allowed-emails");
  const snap = await col.get();

  let deleted = 0;
  const keepDocIds = [];

  for (const doc of snap.docs) {
    const email = normEmail(doc.data());
    if (email === keepLower) {
      keepDocIds.push(doc.id);
      continue;
    }
    await doc.ref.delete();
    deleted++;
    console.log("[allowed-emails] eliminado:", doc.id);
  }

  console.log("[allowed-emails] eliminados:", deleted, "conservados (mismo email):", keepDocIds.length);

  // Un solo documento canónico para el admin
  const canonicalRef = col.doc(CANONICAL_DOC_ID);
  const canonicalSnap = await canonicalRef.get();

  for (const id of keepDocIds) {
    if (id === CANONICAL_DOC_ID) continue;
    await col.doc(id).delete();
    console.log("[allowed-emails] eliminado duplicado admin:", id);
  }

  if (!canonicalSnap.exists) {
    await canonicalRef.set({
      email: keepLower,
      type: "admin",
      enabled: true,
      createdAt: new Date(),
      createdBy: "script-cleanup-2026",
    });
    console.log("[allowed-emails] creado canónico:", CANONICAL_DOC_ID);
  } else {
    await canonicalRef.set(
      {
        email: keepLower,
        type: "admin",
        enabled: true,
        updatedAt: new Date(),
        updatedBy: "script-cleanup-2026",
      },
      { merge: true }
    );
    console.log("[allowed-emails] actualizado canónico:", CANONICAL_DOC_ID);
  }

  const finalSnap = await col.get();
  console.log("[allowed-emails] total documentos ahora:", finalSnap.size);
  for (const d of finalSnap.docs) {
    console.log("  -", d.id, normEmail(d.data()));
  }

  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
