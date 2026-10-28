"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function MyTrainingPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [link, setLink] = useState("");

  async function requestLink(event: React.FormEvent) {
    event.preventDefault();
    setMessage("");
    setLink("");
    const res = await fetch("/api/credits/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const body = (await res.json()) as { message?: string; error?: string; demoLink?: string };
    setMessage(body.message ?? body.error ?? "Check your email.");
    if (body.demoLink) setLink(body.demoLink);
  }

  async function openPortal() {
    const res = await fetch("/api/portal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const body = (await res.json()) as { url?: string; error?: string };
    if (body.url) window.location.assign(body.url);
    else setMessage(body.error ?? "Could not open the billing portal.");
  }

  return (
    <section className="mx-auto max-w-lg px-4 py-16">
      <h1 className="font-heading text-4xl text-white">My training</h1>
      <p className="mt-3 text-sm text-white/70">
        Enter the email used at checkout. We&apos;ll send a short-lived link to view remaining
        sessions. Monthly unlimited is managed in the Stripe customer portal.
      </p>
      <form onSubmit={requestLink} className="mt-6 space-y-4">
        <input
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@email.com"
          className="w-full rounded-md border border-white/15 bg-surface px-3 py-2 text-white"
        />
        <Button type="submit" className="w-full">
          Email my training link
        </Button>
      </form>
      <button type="button" onClick={() => void openPortal()} className="mt-4 text-sm text-gold underline">
        Manage monthly unlimited in Stripe
      </button>
      {message ? <p className="mt-4 text-sm text-white/80">{message}</p> : null}
      {link ? (
        <p className="mt-2 text-sm">
          <a href={link} className="text-gold underline">
            Open demo access link
          </a>
        </p>
      ) : null}
    </section>
  );
}
