import type { CartItem } from '@/types';

export function calculateSubtotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

export function calculateDiscount(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.discount * item.quantity, 0);
}

export function calculateTax(subtotal: number, taxRate: number): number {
  return Math.round((subtotal * taxRate) * 100) / 100;
}

export function calculateTotal(subtotal: number, tax: number, totalDiscount: number): number {
  return Math.round((subtotal + tax - totalDiscount) * 100) / 100;
}

export function calculateChange(total: number, amountTendered: number): number {
  return Math.round((amountTendered - total) * 100) / 100;
}

export function getItemCount(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}
