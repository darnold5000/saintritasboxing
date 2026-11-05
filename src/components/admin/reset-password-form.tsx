"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PasswordField } from "@/components/admin/password-field";
import { Button } from "@/components/ui/button";
import { establishSessionFromAuthRedirect } from "@/lib/signalworks/auth-recovery";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

export function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [ready, setReady] = useState<boolean | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const supabase = createBrowserSupabaseClient();
    void supabase.auth.getSession().then(async ({ data }) => {
      if (data.session) {
        setReady(true);
        return;
      }
      const result = await establishSessionFromAuthRedirect(supabase, {
        logTag: "staff-reset-password",
      });
      setReady(result.ok);
      if (!result.ok) setError(result.message);
    });
  }, []);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("Use at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const supabase = createBrowserSupabaseClient();
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) {
        setError("Could not update the password. Request a new reset link and try again.");
        return;
      }
      window.location.assign("/admin");
    } catch {
      setError("Could not update the password.");
    } finally {
      setLoading(false);
    }
  }

  if (ready === null) {
    return <p className="text-sm text-muted-foreground">Checking the reset link…</p>;
  }

  if (!ready) {
    return (
      <div className="space-y-3">
        {error ? <p className="text-sm text-red-700">{error}</p> : null}
        <Link href="/login/forgot" className="text-sm font-semibold text-brand">
          Request a new reset link
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={(event) => void onSubmit(event)} className="space-y-4">
      <PasswordField
        id="new-password"
        label="New password"
        value={password}
        onChange={setPassword}
        autoComplete="new-password"
      />
      <PasswordField
        id="confirm-password"
        label="Confirm password"
        value={confirm}
        onChange={setConfirm}
        autoComplete="new-password"
      />
      {error ? (
        <p className="text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Saving…" : "Save password"}
      </Button>
    </form>
  );
}
