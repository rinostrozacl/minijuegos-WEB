import { getFinalEvalConfig, ensureFinalEvalConfigDoc } from "../../utils/finalEvalService";

export default defineEventHandler(async () => {
  await ensureFinalEvalConfigDoc();
  const config = await getFinalEvalConfig();
  return {
    status: config.status,
  };
});
