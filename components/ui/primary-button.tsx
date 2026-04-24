import type { ComponentProps } from "react";

import { Button } from "@/components/ui/button";

export function PrimaryButton(props: ComponentProps<typeof Button>) {
  return <Button size="lg" variant="gold" {...props} />;
}
