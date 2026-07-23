/**
 * Friendly, user-facing messages for Firebase Auth error codes. Pure function so
 * it can be unit-tested without a browser. Used by the Google sign-in button and
 * available to any auth UI.
 */
export function googleAuthErrorMessage(code) {
  switch (code) {
    case "auth/popup-closed-by-user":
    case "auth/cancelled-popup-request":
    case "auth/user-cancelled":
      return "Sign-in was cancelled. Please try again.";
    case "auth/popup-blocked":
      return "Your browser blocked the sign-in window. Please allow pop-ups, or try again to continue with a redirect.";
    case "auth/unauthorized-domain":
      return "Sign-in isn’t allowed from this web address yet. Please try again later.";
    case "auth/account-exists-with-different-credential":
      return "An account already exists with this email using a different sign-in method. Sign in with that method instead.";
    case "auth/network-request-failed":
      return "Network error. Check your connection and try again.";
    case "auth/too-many-requests":
      return "Too many attempts. Please wait a moment and try again.";
    case "auth/operation-not-allowed":
      return "Google sign-in is not enabled for this app.";
    default:
      return "Unable to sign in with Google. Please try again.";
  }
}

/** Popup failures where falling back to a full-page redirect is worthwhile. */
export function shouldFallbackToRedirect(code) {
  return (
    code === "auth/popup-blocked" ||
    code === "auth/cancelled-popup-request" ||
    code === "auth/operation-not-supported-in-environment" ||
    code === "auth/web-storage-unsupported"
  );
}
