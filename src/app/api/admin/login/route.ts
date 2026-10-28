import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { TABLES } from "@/lib/tables";
import { isStaffRole } from "@/lib/auth/staff";
import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/supabase/server";

const bodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: Request) {
  const url = getSupabaseUrl();
  const anonKey = getSupabaseAnonKey();
  if (!url || !anonKey) {
    return NextResponse.json(
      { error: "Supabase is not configured. Staff login is unavailable in demo mode." },
      { status: 503 },
    );
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 400 });
  }

  const cookieStore = await cookies();
  const pendingCookies: {
    name: string;
    value: string;
    options?: Parameters<typeof cookieStore.set>[2];
  }[] = [];

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          pendingCookies.push({ name, value, options });
        });
      },
    },
  });

  const { data: signIn, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error || !signIn.user) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  const { data: staff } = await supabase
    .from(TABLES.staff)
    .select("user_id, role, active")
    .eq("user_id", signIn.user.id)
    .maybeSingle();

  const response = NextResponse.json(
    staff && staff.active && isStaffRole(staff.role)
      ? { redirectTo: "/admin" }
      : { error: "Signed in, but this account is not authorized for St. Rita's staff admin." },
    { status: staff && staff.active && isStaffRole(staff.role) ? 200 : 403 },
  );

  for (const cookie of pendingCookies) {
    response.cookies.set(cookie.name, cookie.value, cookie.options);
  }
  return response;
}
