import { getFirestore } from "firebase-admin/firestore";
import { assertAdminFromRequest } from "../../utils/peerEvalAuth";

function displayGameTitle(theme: Record<string, unknown>) {
  const gt = String(theme.gameTitle || "").trim();
  return gt || String(theme.title || "Sin título");
}

export default defineEventHandler(async (event) => {
  await assertAdminFromRequest(event);
  const db = getFirestore();

  const themesSnap = await db
    .collection("themes")
    .where("available", "==", false)
    .get();

  const games = themesSnap.docs.map((doc) => {
    const d = doc.data();
    const responsables = [d.reservedBy, d.teammateName].filter(Boolean).join(" · ");
    return {
      id: doc.id,
      numero: d.numero ?? doc.id,
      title: displayGameTitle(d),
      responsables,
      reservedById: d.reservedById,
      teammateUid: d.teammateUid,
    };
  });

  games.sort((a, b) => Number(a.numero) - Number(b.numero));

  return { games };
});
