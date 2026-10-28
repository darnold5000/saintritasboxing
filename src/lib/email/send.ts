import {
  createResendProvider,
  formatBrandedFromAddress,
  resolveResendFromEmail,
} from "@/lib/signalworks/email";
import { ownerNotifyEmail } from "@/lib/config-status";
import { SITE } from "@/lib/site";

export function isEmailConfigured() {
  return Boolean(
    process.env.RESEND_API_KEY?.trim() && process.env.RESEND_FROM_EMAIL?.trim(),
  );
}

function fromAddress() {
  const email = resolveResendFromEmail({
    RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL,
  });
  return formatBrandedFromAddress(SITE.name, email);
}

export async function sendTransactionalEmail(input: {
  to: string;
  subject: string;
  html: string;
  text: string;
  tag: string;
}) {
  const provider = createResendProvider();
  if (!provider) {
    console.warn("Email skipped: Resend is not configured.");
    return { ok: false as const, skipped: true };
  }
  const result = await provider.send({
    from: fromAddress(),
    to: input.to,
    subject: input.subject,
    html: input.html,
    text: input.text,
    tags: [{ name: "kind", value: input.tag }],
  });
  if (!result.ok) {
    console.error("Email send failed", result.message);
  }
  return result;
}

export async function notifyOwner(input: {
  subject: string;
  html: string;
  text: string;
  tag: string;
}) {
  const to = ownerNotifyEmail();
  if (!to) {
    console.warn("Owner notification skipped: OWNER_EMAIL is not set.");
    return { ok: false as const, skipped: true };
  }
  return sendTransactionalEmail({ ...input, to });
}
