"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useProfile } from "@/lib/ProfileProvider";
import Dashboard from "@/components/Dashboard";

export default function DashboardPage() {
  const { profile, ready } = useProfile();
  const router = useRouter();

  // No profile → send to login.
  useEffect(() => {
    if (ready && !profile) router.replace("/login");
  }, [ready, profile, router]);

  if (!ready || !profile) return null;
  return <Dashboard />;
}
