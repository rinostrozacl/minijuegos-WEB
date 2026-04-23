/**
 * Elimina todos los usuarios de Firebase Auth y documentos en Firestore `users`,
 * excepto el correo indicado en KEEP_EMAIL (administrador).
 *
 * Uso (desde la raíz del repo):
 *   node scripts/delete-all-users-except-admin.mjs
 *
 * Requiere: minijuegos-firebasekey.json en la raíz (service account).
 */
import { createRequire } from "module";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

const KEEP_EMAIL = "ricardoinostrozare@santotomas.cl";

const admin = require("firebase-admin");
const keyPath = path.resolve(__dirname, "..", "minijuegos-firebasekey.json");

admin.initializeApp({
  credential: admin.credential.cert(keyPath),
});

async function deleteAuthExcept() {
  const keep = await admin.auth().getUserByEmail(KEEP_EMAIL);
  const keepUid = keep.uid;
  let pageToken;
  let deleted = 0;
  let skipped = 0;

  do {
    const result = await admin.auth().listUsers(1000, pageToken);
    for (const user of result.users) {
      if (user.uid === keepUid) {
        skipped++;
        continue;
      }
      await admin.auth().deleteUser(user.uid);
      deleted++;
      console.log("[auth] eliminado:", user.uid, user.email || "");
    }
    pageToken = result.pageToken;
  } while (pageToken);

  console.log("[auth] resumen: eliminados=", deleted, "conservados=", skipped);
  return keepUid;
}

async function deleteFirestoreUsersExcept(keepUid) {
  const snap = await admin.firestore().collection("users").get();
  let deleted = 0;
  for (const doc of snap.docs) {
    if (doc.id === keepUid) continue;
    await doc.ref.delete();
    deleted++;
    console.log("[firestore users] eliminado:", doc.id);
  }
  console.log("[firestore users] resumen: eliminados=", deleted);
}

async function main() {
  console.log("Conservar solo:", KEEP_EMAIL);
  const keepUid = await deleteAuthExcept();
  await deleteFirestoreUsersExcept(keepUid);
  console.log("Listo.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
