export function money(value: string | number | null | undefined, devise = "USD") {
  const amount = Number(value ?? 0);
  return new Intl.NumberFormat("fr-CD", { style: "currency", currency: devise }).format(amount);
}

export function shortDate(value?: string | null) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(new Date(value));
}

