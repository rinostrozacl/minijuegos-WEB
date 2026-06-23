import { getFirebaseAdminStatus } from "../../plugins/firebase-admin";
import { firebaseCredentialConfigHint } from "../../utils/firebaseAdminCredentials";

export default defineEventHandler(() => {
  const status = getFirebaseAdminStatus();

  return {
    initialized: status.isInitialized,
    appsCount: status.appsCount,
    credentialsPresent: status.credentialsPresent,
    privateKeyPemValid: status.privateKeyPemValid,
    credentialSource: status.credentialSource,
    hasError: status.hasError,
    errorMessage: status.hasError ? status.errorMessage : undefined,
    hint:
      status.credentialSource === "runtimeConfig"
        ? "Clave congelada en el build. Usa FIREBASE_SERVICE_ACCOUNT_JSON en Coolify y redeploy."
        : !status.privateKeyPemValid && status.credentialsPresent
          ? firebaseCredentialConfigHint()
          : undefined,
  };
});
