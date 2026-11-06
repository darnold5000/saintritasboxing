"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createBrowserClient } from "@supabase/ssr";
import { establishSessionFromAuthRedirect } from "@/lib/signalworks/auth-recovery";

const RESET_PATH = "/auth/reset-password";

export function AuthCallback() {
  const [error, setError] = useState("");

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
    if (!url || !anonKey) {
      setError("Password reset is not configured.");
      return;
    }

    const current = new URL(window.location.href);
    const next = current.searchParams.get("next");
    const destination = next === RESET_PATH ? RESET_PATH : "/login/forgot";

    const supabase = createBrowserClient(url, anonKey, {
      isSingleton: false,
      auth: { detectSessionInUrl: false },
    });

    void establishSessionFromAuthRedirect(supabase, {
      logTag: "staff-auth-callback",
    }).then((result) => {
      if (!result.ok) {
        setError(result.message);
        return;
      }
      window.location.assign(destination);
    });
  }, []);

  if (error) {
    return (
      <div className="mt-6 space-y-3">
        <p className="text-sm text-red-700" role="alert">
          {error}
        </p>
        <Link href="/login/forgot" className="text-sm font-semibold text-brand">
          Request a new reset link
        </Link>
      </div>
    );
  }

  return <p className="mt-6 text-sm text-muted-foreground">Opening the password reset page…</p>;
}
