/** Data civil em Lisboa (YYYY-MM-DD) para jornada diária. */
export function getTodayDateLisbon(): string {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Lisbon",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

/** Data civil em Lisboa para um instante ISO (útil para filtrar check-ins/refeições "de hoje"). */
export function formatDateLisbon(iso: string): string {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Lisbon",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(iso));
}

export function formatTimeHm(t: string | null | undefined): string {
  if (!t) {
    return "";
  }
  return t.slice(0, 5);
}
