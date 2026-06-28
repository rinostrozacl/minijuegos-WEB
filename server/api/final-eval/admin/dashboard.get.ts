import { assertAdminFromRequest } from "../../../utils/finalEvalAuth";
import { getFinalEvalDashboard } from "../../../utils/finalEvalService";

export default defineEventHandler(async (event) => {
  await assertAdminFromRequest(event);
  return await getFinalEvalDashboard();
});
