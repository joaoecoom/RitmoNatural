import type { ReactNode } from "react";
import Image from "next/image";
import { PlayCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";

export function VoiceCard({
  eyebrow = "A Voz",
  title,
  body,
  cta = "Ouvir agora",
  onDark = false,
  footer,
  audioSrc,
}: {
  eyebrow?: string;
  title: string;
  body: string;
  cta?: string;
  onDark?: boolean;
  footer?: ReactNode;
  /** URL assinada ou publica para elemento audio (TTS). */
  audioSrc?: string | null;
}) {
  return (
    <Card
      tone={onDark ? "dark" : "soft"}
      className={cn("overflow-hidden", onDark && "text-white")}
    >
      <div className="relative">
        <div className="mx-auto mb-6 flex justify-center">
          <div className="relative h-[7.25rem] w-[7.25rem] sm:h-[8rem] sm:w-[8rem]">
            <Image
              alt="A VOZ — aqui para ti"
              className="object-contain drop-shadow-[0_14px_36px_rgba(198,167,94,0.22)]"
              fill
              priority
              sizes="(max-width: 640px) 116px, 128px"
              src="/brand/a-voz-logo.png"
            />
          </div>
        </div>

        <p
          className={cn(
            "text-center text-[11px] uppercase tracking-[0.28em]",
            onDark ? "text-[rgba(255,255,255,0.56)]" : "text-[rgba(15,26,20,0.44)]",
          )}
        >
          {eyebrow}
        </p>
        <h2 className="mx-auto mt-3 max-w-xl text-center font-serif text-4xl leading-tight">
          {title}
        </h2>
        <p
          className={cn(
            "mx-auto mt-4 max-w-xl text-center text-sm leading-8",
            onDark ? "text-[rgba(255,255,255,0.72)]" : "text-[rgba(15,26,20,0.58)]",
          )}
        >
          {body}
        </p>

        <div className="mt-7 flex justify-center">
          {audioSrc ? (
            <audio
              className="h-11 w-full max-w-md rounded-2xl"
              controls
              preload="metadata"
              src={audioSrc}
            >
              <track kind="captions" />
            </audio>
          ) : (
            <Button size="lg" variant={onDark ? "gold" : "primary"} type="button">
              <PlayCircle className="mr-2 size-4" />
              {cta}
            </Button>
          )}
        </div>

        {footer ? <div className="mt-6">{footer}</div> : null}
      </div>
    </Card>
  );
}
