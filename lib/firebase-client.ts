"use client";

/**
 * Firebase Web SDK initialization for the browser. Uses only NEXT_PUBLIC_*
 * values (safe to expose — they identify the project to the client SDK; they are
 * not secrets). Server credentials live only in the trusted backend.
 */
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";

const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export function isFirebaseClientConfigured(): boolean {
  return Boolean(config.apiKey && config.authDomain && config.projectId && config.appId);
}

export function getFirebaseApp(): FirebaseApp {
  if (!isFirebaseClientConfigured()) {
    throw new Error(
      "Firebase Web config is missing. Set NEXT_PUBLIC_FIREBASE_* in your environment."
    );
  }
  return getApps().length ? getApp() : initializeApp(config);
}

export function getFirebaseAuth(): Auth {
  return getAuth(getFirebaseApp());
}
