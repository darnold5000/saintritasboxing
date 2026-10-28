"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "demo" | "error">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setMessage("");
    const form = new FormData(event.currentTarget);
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        email: form.get("email"),
        phone: form.get("phone"),
        message: form.get("message"),
      }),
    });
    const body = (await res.json()) as { error?: string; demo?: boolean };
    if (!res.ok) {
      setStatus("error");
      setMessage(body.error ?? "Could not send.");
      return;
    }
    setStatus(body.demo ? "demo" : "sent");
    setMessage(
      body.demo
        ? "Demo mode: the form works, but email delivery needs Resend and OWNER_EMAIL."
        : "Message sent. We'll get back to you.",
    );
    event.currentTarget.reset();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-white/10 bg-surface p-6">
      <label className="block text-sm text-white/80">
        Name
        <input
          name="name"
          required
          className="mt-1 w-full rounded-md border border-white/15 bg-ink px-3 py-2 text-white"
        />
      </label>
      <label className="block text-sm text-white/80">
        Email
        <input
          name="email"
          type="email"
          required
          className="mt-1 w-full rounded-md border border-white/15 bg-ink px-3 py-2 text-white"
        />
      </label>
      <label className="block text-sm text-white/80">
        Phone
        <input
          name="phone"
          type="tel"
          required
          className="mt-1 w-full rounded-md border border-white/15 bg-ink px-3 py-2 text-white"
        />
      </label>
      <label className="block text-sm text-white/80">
        Message
        <textarea
          name="message"
          required
          rows={5}
          className="mt-1 w-full rounded-md border border-white/15 bg-ink px-3 py-2 text-white"
        />
      </label>
      {message ? (
        <p className={status === "error" ? "text-sm text-red-300" : "text-sm text-gold"}>{message}</p>
      ) : null}
      <Button type="submit" disabled={status === "sending"}>
        {status === "sending" ? "Sending…" : "Send message"}
      </Button>
    </form>
  );
}
