"use client";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { getFirebaseAuth, isFirebaseClientConfigured } from "@/lib/firebase-client";
import { authedFetch } from "@/lib/api-client";

function friendlyError(code: string): string {
  switch (code) {
    case "auth/email-already-in-use":
      return "An account with this email already exists.";
    case "auth/invalid-email":
      return "Enter a valid email address.";
    case "auth/weak-password":
      return "Use a stronger password of at least 8 characters.";
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "Email or password is incorrect.";
    case "auth/too-many-requests":
      return "Too many attempts. Please wait a moment and try again.";
    default:
      return "Unable to continue. Please try again.";
  }
}

export default function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const [show, setShow] = useState(false);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setMessage("");
    const form = new FormData(e.currentTarget);
    const name = String(form.get("name") || "").trim();
    const email = String(form.get("email") || "").trim();
    const password = String(form.get("password") || "");

    if (!isFirebaseClientConfigured()) {
      setMessage("Authentication is not configured in this environment.");
      setBusy(false);
      return;
    }

    try {
      const auth = getFirebaseAuth();
      if (mode === "signup") {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        if (name) await updateProfile(cred.user, { displayName: name });
        // Create the server-side profile (roles default to learner).
        await authedFetch("/api/auth/session", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ name }),
        });
        setMessage("Account created. Opening your dashboard…");
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        await authedFetch("/api/auth/session", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({}),
        });
        setMessage("Signed in. Opening your dashboard…");
      }
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      const code = (error as { code?: string })?.code || "";
      setMessage(friendlyError(code));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="card mx-auto max-w-md space-y-5 p-7">
      {mode === "signup" && (
        <label className="block font-bold">
          Name
          <input name="name" required minLength={2} autoComplete="name" className="mt-2 min-h-12 w-full rounded-lg border border-border px-3" />
        </label>
      )}
      <label className="block font-bold">
        Email address
        <input name="email" required type="email" autoComplete="email" className="mt-2 min-h-12 w-full rounded-lg border border-border px-3" />
      </label>
      <label className="block font-bold">
        Password
        <span className="mt-2 flex">
          <input
            name="password"
            required
            minLength={8}
            type={show ? "text" : "password"}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            aria-describedby="password-help"
            className="min-h-12 min-w-0 flex-1 rounded-s-lg border border-border px-3"
          />
          <button type="button" onClick={() => setShow((v) => !v)} className="min-h-12 rounded-e-lg border border-s-0 border-border px-4" aria-pressed={show}>
            {show ? "Hide" : "Show"}
          </button>
        </span>
        <span id="password-help" className="mt-2 block text-xs font-normal text-muted">
          Use at least 8 characters.
        </span>
      </label>
      <button disabled={busy} className="btn-primary w-full disabled:opacity-60" type="submit">
        {busy ? "Please wait…" : mode === "login" ? "Log in" : "Create free account"}
      </button>
      <p className="min-h-6 text-sm text-indigo-brand" role="status">
        {message}
      </p>
    </form>
  );
}
