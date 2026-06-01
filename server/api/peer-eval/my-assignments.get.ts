import { getFirestore } from "firebase-admin/firestore";
import { verifyIdTokenFromRequest } from "../../utils/peerEvalAuth";
import { getPeerEvalRef } from "../../utils/peerEvalService";
import type { PeerEvalAssignmentDoc } from "../../utils/peerEvalTypes";

function displayGameTitle(theme: Record<string, unknown>) {
  const gt = String(theme.gameTitle || "").trim();
  return gt || String(theme.title || "Sin título");
}

export default defineEventHandler(async (event) => {
  const user = await verifyIdTokenFromRequest(event);
  const query = getQuery(event);
  const evalId = query.evalId ? String(query.evalId) : undefined;

  const db = getFirestore();

  if (evalId) {
    const { data } = await getPeerEvalRef(evalId);
    const assignSnap = await db
      .collection("peerEvaluations")
      .doc(evalId)
      .collection("assignments")
      .doc(user.uid)
      .get();

    if (!assignSnap.exists) {
      throw createError({
        statusCode: 404,
        statusMessage: "No tienes asignación en esta evaluación",
      });
    }

    const assignment = assignSnap.data() as PeerEvalAssignmentDoc;
    const games = await loadGamesDetail(db, assignment.assignedGameIds || []);
    const submissions = await loadUserSubmissions(db, evalId, user.uid);

    return {
      evaluation: {
        id: evalId,
        name: data.name,
        status: data.status,
        isIntakeEnabled: data.isIntakeEnabled,
        gamesPerEvaluator: data.gamesPerEvaluator,
      },
      assignment,
      games,
      submissions,
    };
  }

  const activeSnap = await db
    .collection("peerEvaluations")
    .where("status", "==", "activa")
    .get();

  const evaluations: Array<{
    id: string;
    name: string;
    progress: { completed: number; total: number };
  }> = [];

  for (const doc of activeSnap.docs) {
    if (!doc.data().isIntakeEnabled) continue;
    const assignSnap = await doc.ref.collection("assignments").doc(user.uid).get();
    if (!assignSnap.exists) continue;

    const a = assignSnap.data() as PeerEvalAssignmentDoc;
    const total = (a.assignedGameIds || []).length;
    const completed = (a.completedGameIds || []).length;
    evaluations.push({
      id: doc.id,
      name: doc.data().name,
      progress: { completed, total },
    });
  }

  return { evaluations };
});

async function loadGamesDetail(
  db: FirebaseFirestore.Firestore,
  gameIds: string[]
) {
  const games = [];
  for (const id of gameIds) {
    const snap = await db.collection("themes").doc(id).get();
    if (!snap.exists) continue;
    const d = snap.data()!;
    games.push({
      id: snap.id,
      numero: d.numero ?? d.id,
      title: displayGameTitle(d),
      reservedBy: d.reservedBy || "",
      teammateName: d.teammateName || "",
    });
  }
  return games;
}

async function loadUserSubmissions(
  db: FirebaseFirestore.Firestore,
  evalId: string,
  uid: string
) {
  const snap = await db
    .collection("peerEvaluations")
    .doc(evalId)
    .collection("submissions")
    .where("evaluatorUid", "==", uid)
    .get();

  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}
