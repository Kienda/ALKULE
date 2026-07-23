"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useProfile } from "@/lib/ProfileProvider";
import { authedFetch } from "@/lib/api-client";

export default function ProfileClient() {
  const { profile, ready, signOut } = useProfile();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const loadAvatar = useCallback(async () => {
    try {
      const res = await authedFetch("/api/uploads/avatar");
      if (res.ok) setAvatarUrl((await res.json()).url ?? null);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (profile) loadAvatar();
  }, [profile, loadAvatar]);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setStatus("");
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await authedFetch("/api/uploads/avatar", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed.");
      setAvatarUrl(data.url);
      setStatus("Photo updated.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setBusy(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  if (!ready) {
    return (
      <div className="card mt-8 max-w-xl p-7" role="status">
        Loading your profile…
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="card mt-8 max-w-xl p-7">
        <h2 className="text-xl font-bold">No signed-in profile</h2>
        <p className="mt-3 text-muted">Sign in to manage your profile and saved learning.</p>
        <div className="mt-6 flex gap-3">
          <Link href="/login" className="btn-secondary">
            Log in
          </Link>
          <Link href="/signup" className="btn-primary">
            Create account
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="card mt-8 max-w-xl p-7">
      <div className="flex items-center gap-5">
        <div className="grid h-20 w-20 place-items-center overflow-hidden rounded-full bg-paper text-2xl font-bold text-indigo-brand">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt="Your profile photo" className="h-full w-full object-cover" />
          ) : (
            (profile.name?.[0] ?? "A").toUpperCase()
          )}
        </div>
        <div>
          <h2 className="text-xl font-bold">{profile.name}</h2>
          <p className="text-muted">{profile.email}</p>
          <p className="mt-1 text-xs uppercase tracking-wide text-muted">{profile.roles.join(" · ") || "learner"}</p>
        </div>
      </div>

      <div className="mt-6">
        <label className="block font-bold">
          Profile photo
          <input
            ref={fileInput}
            type="file"
            name="avatar"
            id="avatar-upload"
            accept="image/png,image/jpeg,image/webp"
            onChange={onFile}
            disabled={busy}
            className="mt-2 block w-full text-sm file:mr-4 file:min-h-11 file:rounded-lg file:border-0 file:bg-indigo-deep file:px-4 file:text-white"
          />
        </label>
        <p className="mt-2 text-xs text-muted">PNG, JPEG, or WebP, up to 2 MB. Your photo is stored privately.</p>
        <p role="status" className="mt-2 min-h-5 text-sm text-indigo-brand">
          {busy ? "Uploading…" : status}
        </p>
      </div>

      <div className="mt-6 border-t border-border pt-6">
        <button onClick={() => signOut()} className="btn-secondary">
          Sign out
        </button>
      </div>
    </div>
  );
}
