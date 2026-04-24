import Image from "next/image";
import Link from "next/link";
import { Menu } from "lucide-react";

export function WelcomeScreen() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#fff8f5] text-[#201b16]">
      <header className="fixed inset-x-0 top-0 z-30 border-b border-[rgba(127,118,99,0.15)] bg-white/70 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5 sm:px-8">
          <p className="text-xs font-medium uppercase tracking-[0.32em] text-[#201b16]">
            Ritmo Natural
          </p>
          <button
            aria-label="Menu"
            className="inline-flex size-9 items-center justify-center rounded-full text-[#D4AF37]"
            type="button"
          >
            <Menu className="size-5" />
          </button>
        </div>
      </header>

      <main className="relative flex min-h-screen flex-col items-center justify-center px-8 pb-36 pt-28 text-center sm:px-12">
        <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center opacity-[0.04]">
          <Image
            alt="Marca Ritmo Natural em marca de água"
            className="w-[130%] max-w-none rotate-[14deg] object-contain"
            height={900}
            src="/brand/ritmo-natural-logo.png"
            width={900}
          />
        </div>

        <div className="relative z-10 flex w-full max-w-xl flex-col items-center">
          <div className="relative mb-10 size-24 sm:size-28">
            <Image
              alt="Logo Ritmo Natural"
              className="object-contain"
              fill
              priority
              src="/brand/ritmo-natural-logo.png"
            />
          </div>

          <h1 className="text-5xl font-light tracking-[0.08em] text-[#201b16] sm:text-6xl">
            Ritmo
            <br />
            Natural
          </h1>
          <p className="mt-6 text-2xl font-light leading-relaxed tracking-[0.06em] text-[#6a5d43] sm:text-3xl">
            O teu corpo. O teu ritmo.
            <br />A tua transformação.
          </p>

          <Link
            className="mt-14 inline-flex min-h-14 items-center justify-center rounded-full bg-[linear-gradient(180deg,#D4AF37,#C6A75E)] px-12 py-4 text-sm font-semibold uppercase tracking-[0.2em] text-[#201b16] shadow-[0_14px_36px_rgba(212,175,55,0.28)] transition hover:-translate-y-0.5 hover:brightness-[1.02]"
            href="/login"
          >
            Descobrir o Ritmo
          </Link>

          <Link
            className="mt-5 text-xs uppercase tracking-[0.16em] text-[rgba(32,27,22,0.55)] underline decoration-[rgba(32,27,22,0.2)] underline-offset-4"
            href="/register"
          >
            Criar conta
          </Link>
        </div>
      </main>

      <footer className="fixed inset-x-0 bottom-0 z-20 border-t border-[rgba(127,118,99,0.2)] bg-[#fff8f5]/80 px-6 py-6 backdrop-blur sm:px-10">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-4 text-[10px] uppercase tracking-[0.14em] text-[rgba(77,70,53,0.56)] sm:flex-row sm:justify-between">
          <p>© 2024 Aura Wellness. Designed for tranquility.</p>
          <nav className="flex items-center gap-5">
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
            <a href="#">Membership</a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
