import type { HTMLAttributes, PropsWithChildren } from "react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";

export function SectionCard({
  eyebrow,
  title,
  description,
  children,
  className,
  ...props
}: PropsWithChildren<{
  eyebrow?: string;
  title?: string;
  description?: string;
  className?: string;
} & HTMLAttributes<HTMLDivElement>>) {
  return (
    <Card className={cn("space-y-5", className)} tone="soft" {...props}>
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      {title ? (
        <div className="space-y-2">
          <h2 className="font-display text-[1.85rem] font-semibold leading-tight text-[#201B16]">
            {title}
          </h2>
          {description ? (
            <p className="text-sm leading-7 text-[rgba(77,70,53,0.74)]">{description}</p>
          ) : null}
        </div>
      ) : null}
      {children}
    </Card>
  );
}
