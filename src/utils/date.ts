/**
 * Formats a date string or Date object into a readable Gregorian format.
 * @param date The date to format
 * @param formatType 'short' (DD/MM/YYYY) | 'long' (DD MMM YYYY) | 'full' (Weekday, Month DD, YYYY)
 * @param locale The locale to use (defaults to 'en-GB')
 */
export function formatDate(
  date: string | Date | null | undefined,
  formatType: "short" | "long" | "full" = "short",
  locale: string = "en-GB"
): string {
  if (!date) return "-"
  const d = new Date(date)
  if (isNaN(d.getTime())) return "-"

  if (formatType === "short") {
    return d.toLocaleDateString(locale, {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  if (formatType === "long") {
    return d.toLocaleDateString(locale, {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  }

  return d.toLocaleDateString(locale, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

/**
 * Formats a date string or Date object to a Thai format with Buddhist Era (BE) year.
 * e.g., "31 พฤษภาคม 2569" or "31 พ.ค. 2569"
 */
export function formatThaiDate(
  date: string | Date | null | undefined,
  options: { includeTime?: boolean; monthStyle?: "long" | "short" } = {}
): string {
  if (!date) return "-"
  const d = new Date(date)
  if (isNaN(d.getTime())) return "-"

  const formatOptions: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: options.monthStyle || "long",
    year: "numeric",
  }

  if (options.includeTime) {
    formatOptions.hour = "2-digit"
    formatOptions.minute = "2-digit"
    formatOptions.second = "2-digit"
    formatOptions.hour12 = false
  }

  return d.toLocaleDateString("th-TH", formatOptions)
}

/**
 * Formats a date to Buddhist Era (BE) string format: YYYY-MM-DD (e.g. 2569-05-31).
 * Adds 543 years to the Western year if it represents a CE year.
 */
export function formatDateBE(dateStr: string | Date | null | undefined): string {
  if (!dateStr) return "-"
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) {
    return typeof dateStr === "string" ? dateStr : "-"
  }
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  const beYear = y < 2400 ? y + 543 : y
  return `${beYear}-${m}-${d}`
}
