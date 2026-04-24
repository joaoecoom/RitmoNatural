import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";

import { Field, Input, Textarea } from "@/components/ui/field";

export function InputField({
  label,
  hint,
  multiline = false,
  ...props
}: {
  label: string;
  hint?: string;
  multiline?: boolean;
} & (InputHTMLAttributes<HTMLInputElement> | TextareaHTMLAttributes<HTMLTextAreaElement>)) {
  return (
    <Field hint={hint} label={label}>
      {multiline ? (
        <Textarea {...(props as TextareaHTMLAttributes<HTMLTextAreaElement>)} />
      ) : (
        <Input {...(props as InputHTMLAttributes<HTMLInputElement>)} />
      )}
    </Field>
  );
}
