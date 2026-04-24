/** Converte valor de input type="time" (HH:MM) para TIME da BD (HH:MM:SS). */
export function formTimeToDb(value: string): string | null {
  const v = value.trim();
  if (!v) {
    return null;
  }
  return v.length === 5 ? `${v}:00` : v;
}
