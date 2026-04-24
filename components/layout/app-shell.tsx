import Image from "next/image";
import Link from "next/link";
import type { PropsWithChildren } from "react";
import { Bell, LogOut, Settings2, UserRound } from "lucide-react";

import { Card } from "@/components/ui/card";
import { BottomNavigation } from "@/components/ui/bottom-navigation";
import { cn } from "@/lib/utils/cn";
import type { Profile } from "@/types/domain";

export function AppShell({
  children,
  profile,
  avatarSignedUrl,
  notificationBadgeCount = 0,
  appearance = "soft",
}: PropsWithChildren<{
  profile: Profile | null;
  avatarSignedUrl?: string | null;
  notificationBadgeCount?: number;
  appearance?: string;
}>) {
  const isDark = appearance === "dark";
  const headerTone =
    appearance === "dark" ? "dark" : appearance === "soft" ? "soft" : "default";
  const initials =
    profile?.full_name
      ?.split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ?? "RN";

  return (
    <div className="app-shell-background min-h-screen">
      <div className="premium-grid mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 pb-28 pt-5 sm:px-6 sm:pb-12">
        <header className="mb-7">
          <Card
            className="flex items-center justify-between gap-4 px-4 py-4 sm:px-5"
            tone={headerTone}
          >
            <div className="flex min-w-0 items-center gap-3 sm:gap-4">
              <div className="relative h-11 w-[88px] shrink-0 sm:h-[52px] sm:w-[104px]">
                <Image
                  alt="Ritmo Natural"
                  className={cn(
                    "object-contain object-left",
                    isDark
                      ? "drop-shadow-[0_2px_12px_rgba(0,0,0,0.35)]"
                      : "drop-shadow-[0_2px_8px_rgba(32,27,22,0.08)]",
                  )}
                  fill
                  priority
                  sizes="(max-width: 640px) 88px, 104px"
                  src="/brand/ritmo-natural-logo.png"
                />
              </div>
              <div className="min-w-0">
                <p
                  className={cn(
                    "text-[11px] uppercase tracking-[0.28em]",
                    isDark ? "text-[rgba(244,239,230,0.55)]" : "text-[rgba(15,26,20,0.42)]",
                  )}
                >
                  Ritmo Natural
                </p>
                <h1
                  className={cn(
                    "font-serif text-[28px] leading-none",
                    isDark ? "text-[#F4EFE6]" : "text-[#0F1A14]",
                  )}
                >
                  A Voz esta contigo
                </h1>
              </div>
            </div>

            <div className="hidden items-center gap-2 md:flex">
              <BottomNavigation />
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/notifications"
                className="relative flex size-11 items-center justify-center rounded-full bg-[linear-gradient(180deg,rgba(236,213,177,0.62),rgba(229,198,148,0.68))] text-[#201B16] shadow-[0_12px_24px_rgba(198,167,94,0.18)] ring-1 ring-[rgba(198,167,94,0.16)] transition hover:-translate-y-0.5 hover:brightness-[1.02]"
              >
                <Bell className="size-4" />
                {notificationBadgeCount > 0 ? (
                  <span className="absolute -right-0.5 -top-0.5 flex min-w-[18px] items-center justify-center rounded-full bg-[#5c4a2a] px-1 text-[10px] font-semibold leading-none text-[#fef7e8] ring-2 ring-[rgba(255,251,247,0.95)]">
                    {notificationBadgeCount > 9 ? "9+" : notificationBadgeCount}
                  </span>
                ) : null}
              </Link>
              <Link
                href="/settings"
                className={cn(
                  "flex size-11 items-center justify-center rounded-full ring-1 transition",
                  isDark
                    ? "bg-[rgba(255,251,247,0.12)] text-[rgba(244,239,230,0.88)] ring-[rgba(255,251,247,0.14)] hover:text-white"
                    : "bg-[rgba(255,251,247,0.88)] text-[rgba(15,26,20,0.66)] ring-[rgba(15,26,20,0.06)] hover:text-[#0F1A14]",
                )}
              >
                <Settings2 className="size-4" />
              </Link>
              <Link
                href="/profile"
                className={cn(
                  "flex size-11 items-center justify-center rounded-full ring-1 transition md:hidden",
                  isDark
                    ? "bg-[rgba(255,251,247,0.12)] text-[rgba(244,239,230,0.88)] ring-[rgba(255,251,247,0.14)] hover:text-white"
                    : "bg-[rgba(255,251,247,0.88)] text-[rgba(15,26,20,0.74)] ring-[rgba(15,26,20,0.06)] hover:text-[#0F1A14]",
                )}
              >
                <UserRound className="size-4" />
              </Link>
              <Link
                href="/profile"
                className={cn(
                  "hidden items-center gap-2 rounded-full px-3 py-2.5 text-sm ring-1 shadow-[0_10px_22px_rgba(32,27,22,0.05)] transition md:inline-flex",
                  isDark
                    ? "bg-[rgba(255,251,247,0.1)] text-[rgba(244,239,230,0.88)] ring-[rgba(255,251,247,0.12)] hover:text-white"
                    : "bg-[rgba(255,251,247,0.92)] text-[rgba(15,26,20,0.72)] ring-[rgba(15,26,20,0.06)] hover:text-[#0F1A14]",
                )}
              >
                <span
                  className={cn(
                    "flex size-7 items-center justify-center overflow-hidden rounded-full text-[11px] font-semibold",
                    isDark
                      ? "bg-[rgba(236,213,177,0.22)] text-[#F4EFE6]"
                      : "bg-[rgba(236,213,177,0.42)] text-[#201B16]",
                  )}
                >
                  {avatarSignedUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      alt="Fotografia de perfil"
                      className="h-full w-full object-cover"
                      src={avatarSignedUrl}
                    />
                  ) : (
                    initials
                  )}
                </span>
                Perfil
              </Link>
              <Link
                href="/logout"
                className="hidden items-center gap-2 rounded-full bg-[linear-gradient(180deg,#D4AF37,#C6A75E)] px-4 py-3 text-sm font-semibold text-[#201B16] shadow-[0_14px_30px_rgba(198,167,94,0.24)] transition hover:-translate-y-0.5 hover:brightness-[1.02] md:inline-flex"
              >
                Sair
                <LogOut className="size-4" />
              </Link>
              <Link
                href="/logout"
                className="flex size-11 items-center justify-center rounded-full bg-[linear-gradient(180deg,#D4AF37,#C6A75E)] text-[#201B16] shadow-[0_12px_24px_rgba(198,167,94,0.22)] transition hover:brightness-[1.02] md:hidden"
              >
                <LogOut className="size-4" />
              </Link>
            </div>
          </Card>
        </header>

        <div className="mb-7 flex items-end justify-between gap-4 px-1">
          <div>
            <p
              className={cn(
                "text-sm",
                isDark ? "text-[rgba(244,239,230,0.5)]" : "text-[rgba(15,26,20,0.44)]",
              )}
            >
              Hoje vamos com mais calma e seguranca.
            </p>
            <p
              className={cn(
                "mt-2 font-serif text-[40px] leading-none sm:text-[48px]",
                isDark ? "text-[#F4EFE6]" : "text-[#0F1A14]",
              )}
            >
              {profile?.full_name ? `Ola, ${profile.full_name}` : "Ola"}
            </p>
          </div>

          <div
            className={cn(
              "hidden rounded-full px-4 py-2.5 text-sm ring-1 sm:block",
              isDark
                ? "bg-[rgba(255,251,247,0.08)] text-[rgba(244,239,230,0.62)] ring-[rgba(255,251,247,0.1)]"
                : "bg-[rgba(255,251,247,0.86)] text-[rgba(15,26,20,0.56)] ring-[rgba(15,26,20,0.06)]",
            )}
          >
            O teu corpo responde melhor com consistencia suave.
          </div>
        </div>

        <main className="flex-1">{children}</main>

        <BottomNavigation />
      </div>
    </div>
  );
}
