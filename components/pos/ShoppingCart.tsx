'use client';

import type { CartItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Trash2, Plus, Minus } from 'lucide-react';
import { formatCurrency } from '@/lib/formatting';
import {
  calculateSubtotal,
  calculateDiscount,
  calculateTax,
  calculateTotal,
  getItemCount,
} from '@/lib/calculations';

interface ShoppingCartProps {
  items: CartItem[];
  onUpdateItem: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  taxRate?: number;
  totalDiscount?: number;
}

export function ShoppingCart({
  items,
  onUpdateItem,
  onRemoveItem,
  taxRate = 0.12,
  totalDiscount = 0,
}: ShoppingCartProps) {
  const subtotal = calculateSubtotal(items);
  const cartDiscount = calculateDiscount(items) + totalDiscount;
  const tax = calculateTax(subtotal - cartDiscount, taxRate);
  const total = calculateTotal(subtotal, tax, cartDiscount);
  const itemCount = getItemCount(items);

  if (items.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Shopping Cart (Empty)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">
              No items in cart. Scan a product or select from inventory.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center justify-between">
          <span>Shopping Cart</span>
          <span className="text-sm font-normal text-muted-foreground">
            {itemCount} item{itemCount !== 1 ? 's' : ''}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Cart Items */}
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {items.map((item) => (
            <div
              key={item.productId}
              className="flex items-center justify-between gap-3 p-3 bg-muted/30 rounded-lg"
            >
              <div className="flex-1">
                <p className="font-medium text-foreground text-sm">{item.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(item.price)} each
                </p>
              </div>

              <div className="flex items-center gap-2 bg-background border border-border rounded">
                <button
                  onClick={() => onUpdateItem(item.productId, item.quantity - 1)}
                  className="p-1 hover:bg-muted"
                >
                  <Minus className="h-3 w-3" />
                </button>
                <Input
                  type="number"
                  value={item.quantity}
                  onChange={(e) =>
                    onUpdateItem(item.productId, parseInt(e.target.value, 10) || 1)
                  }
                  className="w-10 h-8 text-center border-0 px-0"
                  min="1"
                />
                <button
                  onClick={() => onUpdateItem(item.productId, item.quantity + 1)}
                  className="p-1 hover:bg-muted"
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>

              <div className="text-right min-w-20">
                <p className="font-semibold text-foreground text-sm">
                  {formatCurrency(item.price * item.quantity)}
                </p>
                {item.discount > 0 && (
                  <p className="text-xs text-destructive">
                    -{formatCurrency(item.discount)}
                  </p>
                )}
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemoveItem(item.productId)}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="space-y-2 pt-3 border-t border-border">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Subtotal:</span>
            <span className="font-medium text-foreground">
              {formatCurrency(subtotal)}
            </span>
          </div>

          {cartDiscount > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Discount:</span>
              <span className="font-medium text-destructive">
                -{formatCurrency(cartDiscount)}
              </span>
            </div>
          )}

          {tax > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Tax (12%):</span>
              <span className="font-medium text-foreground">
                {formatCurrency(tax)}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-border">
            <span className="font-semibold text-foreground">Total:</span>
            <span className="text-xl font-bold text-primary">
              {formatCurrency(total)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
