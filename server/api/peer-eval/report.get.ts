import { getFirestore } from "firebase-admin/firestore";
import { assertAdminFromRequest } from "../../utils/peerEvalAuth";
import { getPeerEvalRef } from "../../utils/peerEvalService";
import type { PeerEvalScores } from "../../utils/peerEvalTypes";

function displayGameTitle(theme: Record<string, unknown>) {
  const gt = String(theme.gameTitle || "").trim();
  return gt || String(theme.title || "Sin título");
}

type SortMode = "score_desc" | "name" | "numero";

export default defineEventHandler(async (event) => {
  await assertAdminFromRequest(event);
  const query = getQuery(event);
  const evalId = String(query.evalId || "");
  const sort = (String(query.sort || "score_desc") as SortMode) || "score_desc";

  if (!evalId) {
    throw createError({ statusCode: 400, statusMessage: "evalId requerido" });
  }

  const { db, data } = await getPeerEvalRef(evalId);

  if (data.status !== "finalizada") {
    throw createError({
      statusCode: 400,
      statusMessage: "El reporte solo está disponible para evaluaciones finalizadas",
    });
  }

  const gameIds = data.gameIds || [];
  const submissionsSnap = await db
    .collection("peerEvaluations")
    .doc(evalId)
    .collection("submissions")
    .get();

  const byGame = new Map<
    string,
    {
      scores: PeerEvalScores[];
      averages: number[];
    }
  >();

  for (const id of gameIds) {
    byGame.set(id, { scores: [], averages: [] });
  }

  submissionsSnap.docs.forEach((doc) => {
    const s = doc.data();
    const gameId = s.gameId as string;
    if (!byGame.has(gameId)) return;
    const entry = byGame.get(gameId)!;
    entry.scores.push(s.scores as PeerEvalScores);
    entry.averages.push(s.averageScore as number);
  });

  const rows = [];
  for (const gameId of gameIds) {
    const themeSnap = await db.collection("themes").doc(gameId).get();
    const theme = themeSnap.data() || {};
    const agg = byGame.get(gameId)!;
    const count = agg.averages.length;

    const criteriaAvg: PeerEvalScores = {
      jugabilidad: 0,
      funcionamiento: 0,
      claridad: 0,
      implementacion: 0,
    };

    if (count > 0) {
      for (const sc of agg.scores) {
        criteriaAvg.jugabilidad += sc.jugabilidad;
        criteriaAvg.funcionamiento += sc.funcionamiento;
        criteriaAvg.claridad += sc.claridad;
        criteriaAvg.implementacion += sc.implementacion;
      }
      criteriaAvg.jugabilidad = round2(criteriaAvg.jugabilidad / count);
      criteriaAvg.funcionamiento = round2(criteriaAvg.funcionamiento / count);
      criteriaAvg.claridad = round2(criteriaAvg.claridad / count);
      criteriaAvg.implementacion = round2(criteriaAvg.implementacion / count);
    }

    const finalAverage =
      count > 0
        ? round2(agg.averages.reduce((a, b) => a + b, 0) / count)
        : 0;

    const responsables = [theme.reservedBy, theme.teammateName]
      .filter(Boolean)
      .join(" · ");

    rows.push({
      gameId,
      numero: theme.numero ?? gameId,
      title: displayGameTitle(theme),
      responsables,
      evaluationCount: count,
      finalAverage,
      criteriaAvg,
    });
  }

  rows.sort((a, b) => compareRows(a, b, sort));

  const assignmentsSnap = await db
    .collection("peerEvaluations")
    .doc(evalId)
    .collection("assignments")
    .get();

  let completedEvaluators = 0;
  const gamesPer = data.gamesPerEvaluator || 3;
  assignmentsSnap.docs.forEach((doc) => {
    const completed = (doc.data().completedGameIds || []).length;
    if (completed >= gamesPer) completedEvaluators++;
  });

  return {
    evaluation: {
      id: evalId,
      name: data.name,
      status: data.status,
      gamesPerEvaluator: gamesPer,
    },
    summary: {
      totalEvaluators: assignmentsSnap.size,
      completedEvaluators,
      totalSubmissions: submissionsSnap.size,
    },
    rows,
  };
});

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

function compareRows(
  a: { finalAverage: number; title: string; numero: string | number },
  b: { finalAverage: number; title: string; numero: string | number },
  sort: SortMode
) {
  if (sort === "name") {
    return String(a.title).localeCompare(String(b.title), "es");
  }
  if (sort === "numero") {
    return Number(a.numero) - Number(b.numero);
  }
  if (b.finalAverage !== a.finalAverage) {
    return b.finalAverage - a.finalAverage;
  }
  return String(a.title).localeCompare(String(b.title), "es");
}
