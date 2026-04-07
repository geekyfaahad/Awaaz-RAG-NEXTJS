import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Merge Tailwind classes with clsx for conditional class names.
 * Shared utility — import from here, not inline in components.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
