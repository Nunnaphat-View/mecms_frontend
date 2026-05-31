/**
 * Formats a numeric value to a fixed decimal length.
 * Handles empty, null, or undefined values gracefully by returning a fallback string.
 */
export function formatDecimal(
  value: number | string | null | undefined,
  decimals: number = 2,
  fallback: string = "-"
): string {
  if (value === null || value === undefined || value === "") return fallback
  const num = typeof value === "number" ? value : parseFloat(value)
  if (isNaN(num)) return fallback
  return num.toFixed(decimals)
}

/**
 * Appends a unit to a value if the value is present.
 * e.g. formatMeasurement(25.4, '°C', 1) => "25.4 °C"
 */
export function formatMeasurement(
  value: number | string | null | undefined,
  unit: string | null | undefined,
  decimals?: number,
  fallback: string = "-"
): string {
  if (value === null || value === undefined || value === "") return fallback
  const formattedVal = decimals !== undefined ? formatDecimal(value, decimals, fallback) : String(value)
  if (formattedVal === fallback) return fallback
  return unit ? `${formattedVal} ${unit}` : formattedVal
}

/**
 * Formats a decimal number into a percentage representation.
 * e.g., 0.85 => "85%" or 85 => "85%" (depending on configuration)
 */
export function formatPercentage(
  value: number | string | null | undefined,
  isFraction = false,
  decimals: number = 0,
  fallback: string = "-"
): string {
  if (value === null || value === undefined || value === "") return fallback
  let num = typeof value === "number" ? value : parseFloat(value)
  if (isNaN(num)) return fallback
  if (isFraction) {
    num = num * 100
  }
  return `${num.toFixed(decimals)}%`
}
