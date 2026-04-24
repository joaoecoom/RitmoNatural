"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AudioLines, CalendarDays, Home, UserRound, Utensils } from "lucide-react";

import { cn } from "@/lib/utils/cn";

const items = [
  { href: "/today", label: "Hoje", icon: Home },
  { href: "/journey", label: "Jornada", icon: CalendarDays },
  { href: "/voice", label: "A Voz", icon: AudioLines },
  { href: "/meals", label: "Refeicoes", icon: Utensils },
  { href: "/profile", label: "Perfil", icon: UserRound },
];

export function BottomNavigation() {
  const pathname = usePathname();

  return (
    <>
      <nav className="fixed inset-x-0 bottom-4 z-50 px-4 md:hidden">
        <div className="mx-auto flex max-w-md items-center justify-between rounded-full border border-[rgba(15,26,20,0.06)] bg-[rgba(255,251,247,0.86)] px-3 py-2 shadow-[0_24px_60px_rgba(15,26,20,0.12)] backdrop-blur">
          {items.map((item) => {
            const Icon = item.icon;
            const active = pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex min-w-0 flex-1 flex-col items-center gap-1 rounded-full px-2 py-2 text-[11px] transition",
                  active
                    ? "bg-[rgba(236,213,177,0.46)] text-[#0F1A14] shadow-[0_10px_24px_rgba(198,168,128,0.2)]"
                    : "text-[rgba(15,26,20,0.48)] hover:bg-[rgba(236,213,177,0.2)] hover:text-[rgba(15,26,20,0.76)]",
                )}
              >
                <Icon className="size-4" />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      <nav className="hidden md:flex md:items-center md:gap-2">
        {items.map((item) => {
          const active = pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-full px-4 py-2.5 text-sm transition",
                active
                  ? "bg-[rgba(236,213,177,0.42)] text-[#0F1A14] shadow-[0_12px_26px_rgba(198,168,128,0.22)]"
                  : "text-[rgba(15,26,20,0.56)] hover:bg-[rgba(255,251,247,0.8)] hover:text-[#0F1A14]",
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
