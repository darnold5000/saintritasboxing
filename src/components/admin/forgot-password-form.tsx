"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const body = (await res.json()) as { error?: string; message?: string };
      if (!res.ok) {
        setError(body.error ?? "Could not send a reset link.");
        return;
      }
      setMessage(body.message ?? "Check your email for a reset link.");
    } catch {
      setError("Could not send a reset link.");
    } finally {
      setLoading(false);
    }
  }

  if (message) {
    return (
      <>
        <p className="mt-6 text-sm text-foreground">{message}</p>
        <p className="mt-4 text-sm">
          <Link href="/login" className="font-semibold text-brand">
            Back to staff login
          </Link>
        </p>
      </>
    );
  }

  return (
    <>
      <form onSubmit={(event) => void onSubmit(event)} className="mt-6 space-y-4">
        <label className="block text-sm">
          Email
          <input
            type="email"
            autoComplete="username"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-foreground"
          />
        </label>
        {error ? (
          <p className="text-sm text-red-700" role="alert">
            {error}
          </p>
        ) : null}
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Sending…" : "Send reset link"}
        </Button>
      </form>
      <p className="mt-4 text-sm">
        <Link href="/login" className="font-semibold text-brand">
          Back to staff login
        </Link>
      </p>
    </>
  );
}
