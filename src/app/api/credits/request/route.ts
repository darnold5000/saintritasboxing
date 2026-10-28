import { NextResponse } from "next/server";
import { z } from "zod";
import { SITE } from "@/lib/site";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { getIntegrationStatus } from "@/lib/config-status";
import { customerCredits, issueAccessToken } from "@/lib/data/customers";
import { sendTransactionalEmail } from "@/lib/email/send";
import { magicLinkEmail } from "@/lib/email/templates";

const schema = z.object({ email: z.string().email() });

export async function POST(request: Request) {
  const limited = rateLimit(`credits:${clientIp(request)}`, 5, 15 * 60 * 1000);
  if (!limited.ok) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid email." }, { status: 400 });
  }

  const status = getIntegrationStatus();
  if (!status.supabase) {
    return NextResponse.json({
      demo: true,
      message: "Package lookup is demo-only until Supabase is configured.",
    });
  }

  const credits = await customerCredits(parsed.data.email);
  if (!credits) {
    return NextResponse.json({
      ok: true,
      message: "If that email has training credits, a link is on the way.",
    });
  }

  const token = await issueAccessToken(parsed.data.email);
  const url = `${SITE.url}/my/verify?token=${encodeURIComponent(token)}`;
  if (status.resend) {
    const mail = magicLinkEmail({ name: credits.customer.full_name, url });
    await sendTransactionalEmail({ ...mail, to: credits.customer.email, tag: "magic-link" });
  }

  return NextResponse.json({
    ok: true,
    message: status.resend
      ? "If that email has training credits, a link is on the way."
      : "Resend is not configured, so the access link cannot be emailed yet.",
    demoLink: status.resend ? undefined : url,
  });
}
