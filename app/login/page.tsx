"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useProfile } from "@/lib/ProfileProvider";

export default function LoginPage() {
  const { profile, ready, signIn } = useProfile();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  // Already have a profile → straight to the dashboard.
  useEffect(() => {
    if (ready && profile) router.replace("/dashboard");
  }, [ready, profile, router]);

  return (
    <div className="mx-auto flex max-w-md flex-col px-margin-mobile py-16">
      <h1 className="text-center font-headline-lg text-3xl font-bold text-on-surface">
        Create your profile
      </h1>
      <p className="mx-auto mt-2 max-w-sm text-center text-body-md text-on-surface-variant">
        Start tracking your progress — mastery, streaks, and what to review next.
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!name.trim()) return;
          signIn(name, email);
          router.push("/dashboard");
        }}
        className="mt-8 space-y-4 rounded-2xl border border-outline-variant bg-surface-container-low p-6"
      >
        <label className="block">
          <span className="text-label-md font-semibold text-on-surface">Name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Your name"
            className="mt-1 w-full rounded-lg border border-outline bg-surface-container-lowest px-4 py-2.5 text-on-surface focus:border-primary focus:outline-none"
          />
        </label>
        <label className="block">
          <span className="text-label-md font-semibold text-on-surface">
            Email <span className="font-normal text-on-surface-variant">(optional)</span>
          </span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="mt-1 w-full rounded-lg border border-outline bg-surface-container-lowest px-4 py-2.5 text-on-surface focus:border-primary focus:outline-none"
          />
        </label>
        <button
          type="submit"
          className="w-full rounded-full bg-primary px-6 py-3 font-semibold text-on-primary transition hover:opacity-90 active:scale-95"
        >
          Start tracking progress
        </button>
      </form>

      <p className="mt-4 text-center text-label-md text-on-surface-variant">
        This saves a profile on <strong>this device only</strong> — no password,
        no server yet. Real accounts arrive with the backend.
      </p>
      <Link
        href="/"
        className="mt-6 text-center text-label-md text-primary hover:underline"
      >
        ← Back home
      </Link>
    </div>
  );
}
