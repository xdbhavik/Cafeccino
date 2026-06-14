import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export const formatINR = (amount) => {
  const parsed = parseFloat(amount);
  if (isNaN(parsed)) return "₹0.00";
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(parsed);
};
