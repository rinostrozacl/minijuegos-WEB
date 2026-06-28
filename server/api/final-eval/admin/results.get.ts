import { assertAdminFromRequest } from "../../../utils/finalEvalAuth";
import {
  aggregateFinalEvalResults,
  getFinalEvalConfig,
} from "../../../utils/finalEvalService";

export default defineEventHandler(async (event) => {
  await assertAdminFromRequest(event);
  const config = await getFinalEvalConfig();
  const results = await aggregateFinalEvalResults();

  return {
    status: config.status,
    introText: config.introText || "",
    summary: {
      totalVotes: results.totalVotes,
      uniqueVoters: results.uniqueVoters,
      gamesRated: results.gamesRated,
      totalPublishedGames: results.totalPublishedGames,
    },
    rows: results.rows,
  };
});
