import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const ALLOWED_NEXT = new Set(["/auth/reset-password"]);

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "";
  const destination = ALLOWED_NEXT.has(next) ? next : "/login";

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=reset", url.origin));
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    console.error("[auth/callback]", error.message);
    return NextResponse.redirect(new URL("/login?error=reset", url.origin));
  }

  return NextResponse.redirect(new URL(destination, url.origin));
}
