import { NextResponse } from "next/server";
import { z } from "zod";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { getIntegrationStatus } from "@/lib/config-status";
import { notifyOwner } from "@/lib/email/send";
import { contactEmail } from "@/lib/email/templates";
import { createServiceClient, isServiceRoleConfigured } from "@/lib/supabase/server";
import { TABLES } from "@/lib/tables";

const schema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email(),
  phone: z.string().trim().min(7).max(40),
  message: z.string().trim().min(4).max(4000),
});

export async function POST(request: Request) {
  const limited = rateLimit(`contact:${clientIp(request)}`, 5, 15 * 60 * 1000);
  if (!limited.ok) {
    return NextResponse.json({ error: "Too many messages. Try again later." }, { status: 429 });
  }

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Please fill in name, email, phone, and a message." }, { status: 400 });
  }

  if (isServiceRoleConfigured()) {
    const db = createServiceClient();
    await db.from(TABLES.contactMessages).insert({
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      message: parsed.data.message,
    });
  }

  const status = getIntegrationStatus();
  if (!status.resend || !status.ownerEmail) {
    return NextResponse.json({
      demo: true,
      message:
        "Message captured in demo mode. Configure Resend and OWNER_EMAIL to deliver contact form submissions.",
    });
  }

  const mail = contactEmail(parsed.data);
  const result = await notifyOwner({ ...mail, tag: "contact" });
  if (!result.ok) {
    return NextResponse.json({ error: "Could not send the message. Call or text the gym." }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
