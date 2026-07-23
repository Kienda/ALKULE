"use client";

/**
 * App-wide auth/profile state backed by Firebase Authentication. Replaces the
 * former local-device placeholder. `useProfile()` keeps its previous shape
 * (`profile`, `ready`) so existing consumers keep working; `profile.name` is the
 * display name, now sourced from the authenticated Firestore profile.
 *
 * On sign-in, the backend `/api/auth/session` endpoint is called to create (on
 * first sight) and return the Firestore profile, including server-authoritative
 * roles. Roles are never taken from the browser.
 */
import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut as firebaseSignOut } from "firebase/auth";
import { getFirebaseAuth, isFirebaseClientConfigured } from "./firebase-client";
import { authedFetch } from "./api-client";

export interface Profile {
  uid: string;
  name: string;
  email: string | null;
  roles: string[];
}

interface Ctx {
  profile: Profile | null;
  /** true once the initial auth state has resolved (avoids SSR/flash). */
  ready: boolean;
  signOut: () => Promise<void>;
}

const ProfileContext = createContext<Ctx>({
  profile: null,
  ready: false,
  signOut: async () => {},
});

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isFirebaseClientConfigured()) {
      setReady(true);
      return;
    }
    const unsubscribe = onAuthStateChanged(getFirebaseAuth(), async (user) => {
      if (!user) {
        setProfile(null);
        setReady(true);
        return;
      }
      const fallback: Profile = {
        uid: user.uid,
        name: user.displayName || user.email || "Learner",
        email: user.email,
        roles: [],
      };
      try {
        const res = await authedFetch("/api/auth/session", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({}),
        });
        if (res.ok) {
          const { user: p } = await res.json();
          setProfile({ uid: p.uid, name: p.name, email: p.email, roles: p.roles ?? [] });
        } else {
          setProfile(fallback);
        }
      } catch {
        setProfile(fallback);
      }
      setReady(true);
    });
    return () => unsubscribe();
  }, []);

  async function signOut() {
    if (isFirebaseClientConfigured()) {
      await firebaseSignOut(getFirebaseAuth());
    }
    setProfile(null);
  }

  return (
    <ProfileContext.Provider value={{ profile, ready, signOut }}>{children}</ProfileContext.Provider>
  );
}

export const useProfile = () => useContext(ProfileContext);
