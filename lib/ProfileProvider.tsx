"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { loadProfile, saveProfile, clearProfile, type Profile } from "./profile";

interface Ctx {
  profile: Profile | null;
  /** true once we've read localStorage (avoids SSR flash). */
  ready: boolean;
  signIn: (name: string, email?: string) => void;
  signOut: () => void;
}

const ProfileContext = createContext<Ctx>({
  profile: null,
  ready: false,
  signIn: () => {},
  signOut: () => {},
});

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setProfile(loadProfile());
    setReady(true);
  }, []);

  function signIn(name: string, email?: string) {
    const p: Profile = { name: name.trim(), email: email?.trim() || undefined, createdAt: Date.now() };
    saveProfile(p);
    setProfile(p);
  }

  function signOut() {
    clearProfile();
    setProfile(null);
  }

  return (
    <ProfileContext.Provider value={{ profile, ready, signIn, signOut }}>
      {children}
    </ProfileContext.Provider>
  );
}

export const useProfile = () => useContext(ProfileContext);
