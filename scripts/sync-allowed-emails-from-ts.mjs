/**
 * Lee los correos en `server/data/allowed-emails.ts` y hace upsert en Firestore
 * colección `allowed-emails` (id canónico: email con @ y . → _).
 *
 * Uso: node scripts/sync-allowed-emails-from-ts.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

const admin = require("firebase-admin");
const keyPath = path.resolve(__dirname, "..", "minijuegos-firebasekey.json");
admin.initializeApp({ credential: admin.credential.cert(keyPath) });

function parseEmailsFromTs(filePath) {
  const text = fs.readFileSync(filePath, "utf8");
  const set = new Set();
  const re = /"([a-zA-Z0-9._+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})"/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    set.add(m[1].toLowerCase().trim());
  }
  return [...set];
}

function roleForEmail(email) {
  const e = email.toLowerCase();
  if (e.endsWith("@alumnos.santotomas.cl")) return "student";
  if (e.endsWith("@santotomas.cl")) return "admin";
  return "student";
}

async function main() {
  const tsPath = path.resolve(__dirname, "..", "server/data/allowed-emails.ts");
  const emails = parseEmailsFromTs(tsPath);
  if (emails.length === 0) {
    console.error("No se encontraron correos en", tsPath);
    process.exit(1);
  }

  const db = admin.firestore();
  const col = db.collection("allowed-emails");
  const now = new Date();

  for (const email of emails) {
    const docId = email.replace(/[@.]/g, "_");
    const ref = col.doc(docId);
    const before = await ref.get();
    const payload = {
      email,
      type: roleForEmail(email),
      enabled: true,
      updatedAt: now,
      updatedBy: "sync-allowed-emails-from-ts",
    };
    if (!before.exists || !before.data()?.createdAt) {
      payload.createdAt = now;
    }
    await ref.set(payload, { merge: true });
    console.log("OK", docId);
  }

  console.log("Total sincronizados:", emails.length);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
