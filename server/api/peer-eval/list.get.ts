import { getFirestore } from "firebase-admin/firestore";
import { assertAdminFromRequest } from "../../utils/peerEvalAuth";

export default defineEventHandler(async (event) => {
  await assertAdminFromRequest(event);
  const db = getFirestore();

  const snap = await db.collection("peerEvaluations").get();

  const evaluations = [];

  for (const doc of snap.docs) {
    const d = doc.data();
    const gamesPer = d.gamesPerEvaluator || 3;

    const assignmentsSnap = await doc.ref.collection("assignments").get();
    let completedEvaluators = 0;
    assignmentsSnap.docs.forEach((aDoc) => {
      const completed = (aDoc.data().completedGameIds || []).length;
      if (completed >= gamesPer) completedEvaluators++;
    });

    const totalEvaluators = assignmentsSnap.size;
    const progressPercent =
      totalEvaluators > 0
        ? Math.round((completedEvaluators / totalEvaluators) * 100)
        : 0;

    evaluations.push({
      id: doc.id,
      name: d.name,
      status: d.status,
      gameIds: d.gameIds || [],
      gamesPerEvaluator: gamesPer,
      isIntakeEnabled: d.isIntakeEnabled ?? false,
      gameCount: (d.gameIds || []).length,
      evaluatorCount: totalEvaluators,
      completedEvaluators,
      progressPercent,
      createdAt: d.createdAt,
      generatedAt: d.generatedAt,
      finalizedAt: d.finalizedAt,
    });
  }

  evaluations.sort((a, b) => {
    const ta = a.createdAt?.toMillis?.() ?? 0;
    const tb = b.createdAt?.toMillis?.() ?? 0;
    return tb - ta;
  });

  return { evaluations };
});
