import { escapeHtml } from "@/lib/signalworks/email";
import { SITE } from "@/lib/site";
import { formatUsd } from "@/lib/catalog";

function wrap(title: string, body: string) {
  return `<!doctype html>
<html><body style="margin:0;background:#0B0A0F;color:#F7F4ED;font-family:Arial,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:32px 20px;">
    <p style="color:#F3B72F;letter-spacing:.18em;font-size:12px;font-weight:700;">ST. RITA'S BOXING</p>
    <h1 style="font-size:24px;line-height:1.2;margin:8px 0 16px;">${escapeHtml(title)}</h1>
    ${body}
    <p style="margin-top:28px;font-size:13px;color:#B9B5C0;">
      ${escapeHtml(SITE.address.full)}<br>
      ${escapeHtml(SITE.phone)}
    </p>
  </div>
</body></html>`;
}

export function customerBookingEmail(input: {
  name: string;
  training: string;
  offering: string;
  date?: string;
  time?: string;
  priceCents: number;
  notes?: string;
}) {
  const html = wrap(
    "You're booked in.",
    `<p>Hi ${escapeHtml(input.name.split(" ")[0] || "there")},</p>
     <p>Your St. Rita's Boxing training is confirmed.</p>
     <p>
       <strong>${escapeHtml(input.training)}</strong><br>
       ${escapeHtml(input.offering)}<br>
       ${input.date ? escapeHtml(input.date) : "Schedule your session from your training link."}
       ${input.time ? `<br>${escapeHtml(input.time)}` : ""}<br>
       ${escapeHtml(formatUsd(input.priceCents))}
     </p>
     <p>Location: ${escapeHtml(SITE.address.full)}</p>`,
  );
  const text = [
    "You're booked in.",
    `${input.training} — ${input.offering}`,
    input.date,
    input.time,
    SITE.address.full,
    SITE.phone,
  ]
    .filter(Boolean)
    .join("\n");
  return { html, text, subject: `Training confirmed — ${SITE.name}` };
}

export function customerPurchaseEmail(input: {
  name: string;
  offering: string;
  sessions: number | null;
  priceCents: number;
}) {
  const html = wrap(
    "Purchase confirmed.",
    `<p>Hi ${escapeHtml(input.name.split(" ")[0] || "there")},</p>
     <p>We received your payment for <strong>${escapeHtml(input.offering)}</strong>.</p>
     <p>${input.sessions ? `${input.sessions} sessions on your account.` : "Monthly unlimited is now active."}</p>
     <p>Total paid: ${escapeHtml(formatUsd(input.priceCents))}</p>`,
  );
  const text = `Purchase confirmed: ${input.offering}. ${formatUsd(input.priceCents)}`;
  return { html, text, subject: `Purchase confirmed — ${SITE.name}` };
}

export function ownerBookingEmail(input: {
  name: string;
  email: string;
  phone: string;
  training: string;
  offering: string;
  date?: string;
  time?: string;
  partnerName?: string;
}) {
  const html = wrap(
    "New St. Rita's booking",
    `<p>${escapeHtml(input.name)} booked ${escapeHtml(input.training)}.</p>
     <p>
       ${escapeHtml(input.offering)}<br>
       ${input.date ? escapeHtml(input.date) : "No first session selected"}
       ${input.time ? `<br>${escapeHtml(input.time)}` : ""}<br>
       ${escapeHtml(input.email)}<br>
       ${escapeHtml(input.phone)}
       ${input.partnerName ? `<br>Partner: ${escapeHtml(input.partnerName)}` : ""}
     </p>`,
  );
  const text = `New booking: ${input.name} / ${input.phone} / ${input.training} / ${input.date ?? "unscheduled"} ${input.time ?? ""}`;
  return { html, text, subject: `New booking — ${input.name}` };
}

export function contactEmail(input: {
  name: string;
  email: string;
  phone: string;
  message: string;
}) {
  const html = wrap(
    "Website contact",
    `<p>${escapeHtml(input.name)} sent a message from the St. Rita's site.</p>
     <p>${escapeHtml(input.email)} · ${escapeHtml(input.phone)}</p>
     <p>${escapeHtml(input.message)}</p>`,
  );
  const text = `${input.name}\n${input.email}\n${input.phone}\n\n${input.message}`;
  return { html, text, subject: `Contact form — ${input.name}` };
}

export function magicLinkEmail(input: { name?: string; url: string }) {
  const html = wrap(
    "Your training account",
    `<p>Use this link to view remaining sessions and book with credits. It expires in 30 minutes.</p>
     <p><a href="${escapeHtml(input.url)}" style="color:#F3B72F;">Open my training</a></p>`,
  );
  const text = `Open your training: ${input.url}`;
  return { html, text, subject: `Your ${SITE.name} training link` };
}
