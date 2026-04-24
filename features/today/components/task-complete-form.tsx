"use client";

import { useActionState, useEffect } from "react";
import { Check } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  completeDailyTaskWithFeedbackAction,
  initialCompleteTaskActionState,
} from "@/features/today/server/actions";

export function TaskCompleteForm({
  taskId,
  taskTitle,
  variant = "secondary",
}: {
  taskId: string;
  taskTitle: string;
  variant?: "secondary" | "gold";
}) {
  const router = useRouter();
  const [state, action, pending] = useActionState(
    completeDailyTaskWithFeedbackAction,
    initialCompleteTaskActionState,
  );

  useEffect(() => {
    if (state.success) {
      router.refresh();
    }
  }, [router, state.success]);

  return (
    <div className="grid gap-2">
      <form action={action}>
        <input name="task_id" type="hidden" value={taskId} />
        <input name="task_title" type="hidden" value={taskTitle} />
        <Button size={variant === "gold" ? "lg" : "md"} type="submit" variant={variant} disabled={pending}>
          <Check className="mr-2 size-4" />
          {pending ? "A concluir..." : "Marcar feito"}
        </Button>
      </form>
      {state.success && state.message ? (
        <p className="text-xs font-medium text-[#2d3f30]">{state.message}</p>
      ) : null}
    </div>
  );
}
