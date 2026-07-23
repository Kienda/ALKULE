"use client";

/**
 * Fetch helper that attaches the current Firebase ID token as a Bearer header so
 * the trusted backend can verify identity. Falls back to an unauthenticated
 * request when no user is signed in (e.g. anonymous typing practice), which the
 * backend answers with 401 for protected routes.
 */
import { getFirebaseAuth, isFirebaseClientConfigured } from "./firebase-client";

export async function getIdToken(): Promise<string | null> {
  if (!isFirebaseClientConfigured()) return null;
  const user = getFirebaseAuth().currentUser;
  return user ? user.getIdToken() : null;
}

export async function authedFetch(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
  const token = await getIdToken();
  const headers = new Headers(init.headers || {});
  if (token) headers.set("Authorization", `Bearer ${token}`);
  return fetch(input, { ...init, headers });
}
