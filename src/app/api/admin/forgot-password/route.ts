import { NextResponse } from "next/server";
import { z } from "zod";
import { requestStaffPasswordReset } from "@/lib/auth/staff-password-reset";
import { clientIp, rateLimit } from "@/lib/rate-limit";

const bodySchema = z.object({
  email: z.string().trim().email(),
});

const GENERIC = {
  message: "If that email belongs to a staff account, we sent a link to reset the password.",
};

export async function POST(request: Request) {
  const limited = rateLimit(`forgot:${clientIp(request)}`, 5, 15 * 60 * 1000);
  if (!limited.ok) {
    return NextResponse.json({ error: "Too many reset attempts. Try again later." }, { status: 429 });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  await requestStaffPasswordReset(parsed.data.email);
  return NextResponse.json(GENERIC);
}
