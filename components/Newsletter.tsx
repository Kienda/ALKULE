"use client";

/**
 * Mailing-list capture (from the Stitch Home design). No backend yet — on
 * submit it just shows a local thank-you so the flow is complete visually.
 * Wire to a real list provider when the backend lands.
 */

import { useState } from "react";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  return (
    <section className="mx-auto max-w-max-width px-margin-mobile pb-16 pt-4 md:px-margin-desktop">
      <div className="rounded-3xl border border-outline-variant bg-surface-bright p-8 md:flex md:items-center md:justify-between md:gap-8 md:p-12">
        <div>
          <h2 className="font-headline-md text-headline-md text-on-surface">
            Join the global ADLaM community
          </h2>
          <p className="mt-1 text-body-md text-on-surface-variant">
            Cultural updates, new-lesson alerts, and learner stories from around
            the world.
          </p>
        </div>
        {done ? (
          <p className="mt-4 shrink-0 font-medium text-primary md:mt-0">
            Thanks — you&apos;re on the list. ✓
          </p>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (email.trim()) setDone(true);
            }}
            className="mt-4 flex gap-2 md:mt-0"
          >
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full rounded-lg border border-outline bg-surface-container-lowest px-4 py-2.5 text-body-md text-on-surface focus:border-primary focus:outline-none md:w-64"
            />
            <button
              type="submit"
              className="shrink-0 rounded-lg bg-primary px-5 py-2.5 font-semibold text-on-primary transition hover:opacity-90 active:scale-95"
            >
              Subscribe
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
