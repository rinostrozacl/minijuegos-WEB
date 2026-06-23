import { initializeApp, getApps, cert, getApp } from "firebase-admin/app";
import { getFirestore, Firestore } from "firebase-admin/firestore";
import path from "path";
import fs from "fs";
import {
  hasFirebaseAdminCredentials,
  resolveFirebaseAdminCredentials,
  type FirebaseCredentialSource,
} from "../utils/firebaseAdminCredentials";

let firebaseApp: ReturnType<typeof getApp> | undefined;
let firestoreDb: Firestore | null = null;
let isInitialized = false;
let initializationError: Error | null = null;
let credentialSource: FirebaseCredentialSource = "none";
let initPromise: Promise<void> | null = null;

async function verifyFirestoreConnection(db: Firestore): Promise<void> {
  const testDoc = db.collection("_test_connection").doc("test");
  await testDoc.set({ timestamp: new Date() });
  await testDoc.delete();
}

async function initializeFromCredentials(): Promise<void> {
  if (getApps().length > 0) {
    firebaseApp = getApp();
    firestoreDb = getFirestore(firebaseApp);
    isInitialized = true;
    return;
  }

  const creds = resolveFirebaseAdminCredentials();
  credentialSource = creds.source;

  console.log("[FirebaseAdmin] Credenciales:", {
    source: creds.source,
    projectIdExists: !!creds.projectId,
    clientEmailExists: !!creds.clientEmail,
    privateKeyLength: creds.privateKey.length,
  });

  if (hasFirebaseAdminCredentials(creds)) {
    firebaseApp = initializeApp({
      credential: cert({
        projectId: creds.projectId,
        clientEmail: creds.clientEmail,
        privateKey: creds.privateKey,
      }),
    });
    firestoreDb = getFirestore(firebaseApp);
    await verifyFirestoreConnection(firestoreDb);
    isInitialized = true;
    console.log(
      `[FirebaseAdmin] Inicializado (${creds.source}); Firestore verificado`
    );
    return;
  }

  const serviceAccountPath = path.resolve(
    process.cwd(),
    "minijuegos-firebasekey.json"
  );

  if (!fs.existsSync(serviceAccountPath)) {
    throw new Error(
      "Sin credenciales Firebase Admin. Configura FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL y FIREBASE_PRIVATE_KEY en runtime (Coolify), o coloca minijuegos-firebasekey.json en desarrollo local."
    );
  }

  firebaseApp = initializeApp({
    credential: cert(serviceAccountPath),
  });
  firestoreDb = getFirestore(firebaseApp);
  await verifyFirestoreConnection(firestoreDb);
  credentialSource = "none";
  isInitialized = true;
  console.log("[FirebaseAdmin] Inicializado desde minijuegos-firebasekey.json");
}

/** Inicialización perezosa; segura ante credenciales solo en runtime. */
export async function ensureFirebaseAdmin(): Promise<void> {
  if (isInitialized && getApps().length > 0) {
    return;
  }

  if (initializationError && getApps().length === 0) {
    throw initializationError;
  }

  if (!initPromise) {
    initPromise = initializeFromCredentials().catch((error) => {
      initializationError =
        error instanceof Error ? error : new Error(String(error));
      initPromise = null;
      throw initializationError;
    });
  }

  await initPromise;
}

export function getFirestoreDb(): Firestore {
  if (firestoreDb) {
    return firestoreDb;
  }

  if (initializationError) {
    throw initializationError;
  }

  if (getApps().length > 0) {
    firestoreDb = getFirestore(getApp());
    return firestoreDb;
  }

  throw new Error(
    "Firebase Admin no está inicializado. Llama ensureFirebaseAdmin() antes de usar Firestore."
  );
}

export default defineNitroPlugin(async () => {
  console.log("[Server Plugin] Inicializando Firebase Admin...");

  try {
    const config = useRuntimeConfig();
    const publicProjectId = config.public?.firebaseProjectId as
      | string
      | undefined;
    const creds = resolveFirebaseAdminCredentials();

    if (
      publicProjectId &&
      creds.projectId &&
      publicProjectId !== creds.projectId
    ) {
      console.error(
        "[Server Plugin] ADVERTENCIA: projectId cliente (",
        publicProjectId,
        ") distinto al Admin (",
        creds.projectId,
        ")"
      );
    }

    await ensureFirebaseAdmin();

    console.log(
      "[Server Plugin] Apps de Firebase:",
      getApps().map((app) => app.name),
      "| source:",
      credentialSource
    );
  } catch (error) {
    console.error(
      "[Server Plugin] Error crítico inicializando Firebase Admin:",
      error
    );
    initializationError =
      error instanceof Error ? error : new Error(String(error));
  }
});

export function getFirebaseAdminStatus() {
  const creds = resolveFirebaseAdminCredentials();
  return {
    isInitialized: isInitialized && getApps().length > 0,
    hasFirestoreDb: !!firestoreDb,
    hasError: !!initializationError,
    errorMessage: initializationError?.message,
    appsCount: getApps().length,
    credentialsPresent: hasFirebaseAdminCredentials(creds),
    credentialSource: credentialSource !== "none" ? credentialSource : creds.source,
  };
}
