import type { ReactNode } from "react";
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
}: {
  eyebrow?: string;
  title: string;
  body: string;
  cta?: string;
  onDark?: boolean;
  footer?: ReactNode;
}) {
  return (
    <Card
      tone={onDark ? "dark" : "soft"}
      className={cn("overflow-hidden", onDark && "text-white")}
    >
      <div className="relative">
        <div className="soft-orb mx-auto mb-6 flex size-24 items-center justify-center rounded-full bg-[radial-gradient(circle,_rgba(255,255,255,0.9),_rgba(228,211,168,0.42))] shadow-[0_18px_40px_rgba(198,167,94,0.16)]">
          <div className="flex size-14 items-center justify-center rounded-full bg-[linear-gradient(180deg,#0F1A14,#203027)] text-[13px] font-medium text-[#F8F2EA]">
            Voz
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
          <Button size="lg" variant={onDark ? "gold" : "primary"}>
            <PlayCircle className="mr-2 size-4" />
            {cta}
          </Button>
        </div>

        {footer ? <div className="mt-6">{footer}</div> : null}
      </div>
    </Card>
  );
}
