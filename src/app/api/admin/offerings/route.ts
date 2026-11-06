import { NextResponse } from "next/server";
import { z } from "zod";
import { getStaffSession } from "@/lib/auth/staff";
import { PACKAGE_KIND, TRAINING_TYPE_IDS } from "@/lib/catalog";
import { createOffering, updateOffering } from "@/lib/data/offerings";
import { isServiceRoleConfigured } from "@/lib/supabase/server";

const priceCents = z.number().int().min(0).max(10_000_000);

const createSchema = z
  .object({
    trainingType: z.enum(TRAINING_TYPE_IDS),
    kind: z.enum(PACKAGE_KIND),
    name: z.string().trim().min(2).max(80),
    sessions: z.number().int().min(2).max(200).nullable(),
    priceCents,
    description: z.string().trim().min(4).max(500),
    published: z.boolean(),
  })
  .superRefine((value, ctx) => {
    if (value.kind === "package" && !value.sessions) {
      ctx.addIssue({ code: "custom", message: "Enter how many sessions are in the package.", path: ["sessions"] });
    }
  });

const updateSchema = z.object({
  id: z.string().trim().min(2).max(80),
  name: z.string().trim().min(2).max(80),
  sessions: z.number().int().min(2).max(200).nullable(),
  priceCents,
  description: z.string().trim().min(4).max(500),
  published: z.boolean(),
});

async function requireStaff() {
  const staff = await getStaffSession();
  if (!staff) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isServiceRoleConfigured()) {
    return NextResponse.json({ error: "Database is not configured." }, { status: 503 });
  }
  return null;
}

function saveError(error: unknown) {
  const message = error instanceof Error ? error.message : "Could not save the package.";
  if (message.includes("srb_offerings") || message.includes("PGRST205")) {
    return "Apply migration 008, then try again.";
  }
  return message;
}

export async function POST(request: Request) {
  const denied = await requireStaff();
  if (denied) return denied;
  const parsed = createSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Check the package details, then save again." }, { status: 400 });
  }
  try {
    const offering = await createOffering(parsed.data);
    return NextResponse.json({ offering });
  } catch (error) {
    return NextResponse.json({ error: saveError(error) }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  const denied = await requireStaff();
  if (denied) return denied;
  const parsed = updateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Check the package details, then save again." }, { status: 400 });
  }
  try {
    const offering = await updateOffering(parsed.data);
    return NextResponse.json({ offering });
  } catch (error) {
    return NextResponse.json({ error: saveError(error) }, { status: 400 });
  }
}
