import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { getRequiredSupabaseEnv, isSupabaseConfigured } from "@/lib/config/env";
import type { Database } from "@/types/database";

const protectedRoutes = [
  "/today",
  "/dashboard",
  "/journey",
  "/goals",
  "/schedule",
  "/programs",
  "/upgrade",
  "/admin",
  "/onboarding",
  "/check-in",
  "/meals",
  "/voice",
  "/progress",
  "/notifications",
  "/settings",
  "/profile",
  "/logout",
];

const authRoutes = ["/login", "/register", "/welcome", "/forgot-password"];

export async function proxy(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.next();
  }

  const response = NextResponse.next({
    request,
  });

  const { url, anonKey } = getRequiredSupabaseEnv();

  const supabase = createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          request.cookies.set(name, value);
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route),
  );
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  if (!user && isProtectedRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (user && isAuthRoute) {
    return NextResponse.redirect(new URL("/today", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)"],
};
