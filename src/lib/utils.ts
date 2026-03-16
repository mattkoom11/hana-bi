import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a number as currency in USD format
 * @param amount - The amount to format (in cents or dollars)
 * @param locale - The locale to use (default: 'en-US')
 * @param currency - The currency code (default: 'USD')
 * @returns Formatted currency string (e.g., "$640.00")
 */
export function formatCurrency(
  amount: number,
  locale: string = 'en-US',
  currency: string = 'USD'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(amount)
}
