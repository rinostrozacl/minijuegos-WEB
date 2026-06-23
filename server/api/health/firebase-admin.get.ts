import { getFirebaseAdminStatus } from "../../plugins/firebase-admin";
import {
  firebaseCredentialConfigHint,
  getFirebaseCredentialDiagnostics,
} from "../../utils/firebaseAdminCredentials";

export default defineEventHandler(() => {
  const status = getFirebaseAdminStatus();
  const diag = getFirebaseCredentialDiagnostics();

  return {
    initialized: status.isInitialized,
    appsCount: status.appsCount,
    credentialsPresent: status.credentialsPresent,
    privateKeyPemValid: status.privateKeyPemValid,
    credentialSource: status.credentialSource,
    hasError: status.hasError,
    errorMessage: status.hasError ? status.errorMessage : undefined,
    diagnostics: diag,
    hint:
      status.credentialSource === "FIREBASE_*" && !status.privateKeyPemValid
        ? firebaseCredentialConfigHint()
        : !diag.envFlags.hasServiceAccountJsonBase64 &&
            !diag.envFlags.hasServiceAccountJson
          ? firebaseCredentialConfigHint()
          : undefined,
  };
});
