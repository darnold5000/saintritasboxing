import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { TABLES } from "@/lib/tables";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === "/api/admin/logout") {
    return NextResponse.next();
  }

  let response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !anon) return response;

  const supabase = createServerClient(url, anon, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  let userId: string | null = null;
  try {
    const { data } = await supabase.auth.getUser();
    userId = data.user?.id ?? null;
  } catch (error) {
    console.error("[middleware] session refresh failed", error);
  }

  const isAdmin =
    pathname.startsWith("/admin") || pathname.startsWith("/api/admin");
  const isOpenAdminApi =
    pathname === "/api/admin/login" || pathname === "/api/admin/forgot-password";

  if (!isAdmin || isOpenAdminApi) return response;
  if (!userId) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const { data: staff } = await supabase
    .from(TABLES.staff)
    .select("active, role")
    .eq("user_id", userId)
    .maybeSingle();

  if (!staff?.active) {
    return NextResponse.redirect(new URL("/login?reason=no_staff", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
