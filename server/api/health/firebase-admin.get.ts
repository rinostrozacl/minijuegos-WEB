import { getFirebaseAdminStatus } from "../../plugins/firebase-admin";

export default defineEventHandler(() => {
  const status = getFirebaseAdminStatus();

  return {
    initialized: status.isInitialized,
    appsCount: status.appsCount,
    credentialsPresent: status.credentialsPresent,
    credentialSource: status.credentialSource,
    hasError: status.hasError,
    errorMessage: status.hasError ? status.errorMessage : undefined,
  };
});
