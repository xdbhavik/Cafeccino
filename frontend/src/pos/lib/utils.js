import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const formatINR = (amount) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(amount);

export const formatDateTime = (isoString) =>
  new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(isoString));

export const generateOrderNumber = (existingOrders) => {
  const max = existingOrders.reduce((acc, o) => {
    const parts = o.orderNumber.split('-');
    if (parts.length < 2) return acc;
    const n = parseInt(parts[1], 10);
    return !isNaN(n) && n > acc ? n : acc;
  }, 0);
  return `ORD-${String(max + 1).padStart(4, '0')}`;
};
