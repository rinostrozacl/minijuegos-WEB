import { randomBytes } from "crypto";
import type { Firestore } from "firebase-admin/firestore";

export interface ThemeRow {
  id: string;
  reservedById?: string;
  teammateUid?: string;
  available?: boolean;
}

export interface UserRow {
  id: string;
  reservedTheme?: { id: string };
}

export interface AssignmentResult {
  seed: string;
  assignments: Map<string, string[]>;
  evaluatorCount: number;
  errors: string[];
}

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seedFromString(seedStr: string): number {
  let h = 0;
  for (let i = 0; i < seedStr.length; i++) {
    h = (Math.imul(31, h) + seedStr.charCodeAt(i)) | 0;
  }
  return h >>> 0;
}

function shuffleWithRng<T>(arr: T[], rng: () => number): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function collectEvaluatorUids(
  gameIds: string[],
  themesById: Map<string, ThemeRow>,
  users: UserRow[]
): Set<string> {
  const uids = new Set<string>();

  for (const user of users) {
    if (user.reservedTheme?.id) {
      uids.add(user.id);
    }
  }

  for (const gameId of gameIds) {
    const theme = themesById.get(gameId);
    if (!theme) continue;
    if (theme.reservedById) uids.add(theme.reservedById);
    if (theme.teammateUid) uids.add(theme.teammateUid);
  }

  return uids;
}

export function getExcludedGameIdsForUser(
  uid: string,
  themesById: Map<string, ThemeRow>,
  user?: UserRow
): Set<string> {
  const excluded = new Set<string>();
  if (user?.reservedTheme?.id) {
    excluded.add(user.reservedTheme.id);
  }
  for (const [id, theme] of themesById) {
    if (theme.reservedById === uid) excluded.add(id);
    if (theme.teammateUid === uid) excluded.add(id);
  }
  return excluded;
}

export function buildAssignments(
  gameIds: string[],
  gamesPerEvaluator: number,
  themesById: Map<string, ThemeRow>,
  usersById: Map<string, UserRow>,
  evaluatorUids: Set<string>,
  seed?: string
): AssignmentResult {
  const assignmentSeed = seed || randomBytes(16).toString("hex");
  const rng = mulberry32(seedFromString(assignmentSeed));
  const assignments = new Map<string, string[]>();
  const errors: string[] = [];

  for (const uid of evaluatorUids) {
    const user = usersById.get(uid);
    const excluded = getExcludedGameIdsForUser(uid, themesById, user);
    const eligible = gameIds.filter((id) => !excluded.has(id));

    if (eligible.length < gamesPerEvaluator) {
      errors.push(
        `Usuario ${uid}: solo ${eligible.length} juego(s) elegible(s), se requieren ${gamesPerEvaluator}`
      );
      continue;
    }

    const picked = shuffleWithRng(eligible, rng).slice(0, gamesPerEvaluator);
    assignments.set(uid, picked);
  }

  return {
    seed: assignmentSeed,
    assignments,
    evaluatorCount: assignments.size,
    errors,
  };
}

export async function loadThemesAndUsers(db: Firestore) {
  const themesSnap = await db.collection("themes").where("available", "==", false).get();
  const themesById = new Map<string, ThemeRow>();
  themesSnap.docs.forEach((doc) => {
    const d = doc.data();
    themesById.set(doc.id, {
      id: doc.id,
      reservedById: d.reservedById,
      teammateUid: d.teammateUid,
      available: d.available,
    });
  });

  const usersSnap = await db.collection("users").get();
  const usersById = new Map<string, UserRow>();
  const users: UserRow[] = [];
  usersSnap.docs.forEach((doc) => {
    const d = doc.data();
    const row: UserRow = {
      id: doc.id,
      reservedTheme: d.reservedTheme,
    };
    usersById.set(doc.id, row);
    users.push(row);
  });

  return { themesById, usersById, users };
}

export async function deleteEvalSubcollections(
  db: Firestore,
  evalId: string
) {
  const evalRef = db.collection("peerEvaluations").doc(evalId);
  const batchSize = 400;

  for (const sub of ["assignments", "submissions"] as const) {
    let lastDoc: FirebaseFirestore.QueryDocumentSnapshot | undefined;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      let q = evalRef.collection(sub).limit(batchSize);
      if (lastDoc) q = q.startAfter(lastDoc);
      const snap = await q.get();
      if (snap.empty) break;
      const batch = db.batch();
      snap.docs.forEach((d) => batch.delete(d.ref));
      await batch.commit();
      lastDoc = snap.docs[snap.docs.length - 1];
      if (snap.size < batchSize) break;
    }
  }
}

export async function persistAssignments(
  db: Firestore,
  evalId: string,
  assignments: Map<string, string[]>
) {
  const evalRef = db.collection("peerEvaluations").doc(evalId);
  const batch = db.batch();

  assignments.forEach((gameIds, uid) => {
    const ref = evalRef.collection("assignments").doc(uid);
    batch.set(ref, {
      userId: uid,
      assignedGameIds: gameIds,
      completedGameIds: [],
    });
  });

  await batch.commit();
}
