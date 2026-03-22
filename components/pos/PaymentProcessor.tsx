'use client';

import { useState } from 'react';
import type { PaymentMethod, CartItem } from '@/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field';
import { formatCurrency } from '@/lib/formatting';
import { calculateChange } from '@/lib/calculations';
import { AlertCircle } from 'lucide-react';

interface PaymentProcessorProps {
  total: number;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payment: {
    method: PaymentMethod;
    amountTendered: number;
    change: number;
  }) => void;
  isLoading?: boolean;
}

export function PaymentProcessor({
  total,
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}: PaymentProcessorProps) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [amountTendered, setAmountTendered] = useState<number>(total);

  const change = calculateChange(total, amountTendered);
  const isValidPayment = amountTendered >= total;

  const handleSubmit = () => {
    if (!isValidPayment) {
      alert('Amount tendered is less than total.');
      return;
    }

    onSubmit({
      method: paymentMethod,
      amountTendered,
      change,
    });

    // Reset form
    setPaymentMethod('CASH');
    setAmountTendered(total);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Process Payment</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Total Amount */}
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground mb-1">Total Amount</p>
              <p className="text-3xl font-bold text-primary">
                {formatCurrency(total)}
              </p>
            </CardContent>
          </Card>

          {/* Payment Method */}
          <FieldGroup>
            <FieldLabel>Payment Method</FieldLabel>
            <RadioGroup value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="CASH" id="cash" />
                <Label htmlFor="cash" className="font-normal cursor-pointer">
                  Cash
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="GCASH" id="gcash" />
                <Label htmlFor="gcash" className="font-normal cursor-pointer">
                  GCash
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="PAYAMYA" id="payamya" />
                <Label htmlFor="payamya" className="font-normal cursor-pointer">
                  PayMaya
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="CREDIT" id="credit" />
                <Label htmlFor="credit" className="font-normal cursor-pointer">
                  Customer Credit
                </Label>
              </div>
            </RadioGroup>
          </FieldGroup>

          {/* Amount Tendered */}
          {paymentMethod === 'CASH' && (
            <FieldGroup>
              <Field>
                <FieldLabel>Amount Tendered (₱)</FieldLabel>
                <Input
                  type="number"
                  step="0.01"
                  value={amountTendered}
                  onChange={(e) =>
                    setAmountTendered(parseFloat(e.target.value) || 0)
                  }
                  placeholder="0.00"
                />
              </Field>
            </FieldGroup>
          )}

          {/* Change */}
          {paymentMethod === 'CASH' && (
            <Card className="bg-muted/50">
              <CardContent className="pt-6 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Change:</span>
                  <span
                    className={`text-lg font-semibold ${
                      change < 0 ? 'text-destructive' : 'text-primary'
                    }`}
                  >
                    {formatCurrency(Math.max(change, 0))}
                  </span>
                </div>
                {!isValidPayment && (
                  <div className="flex items-center gap-2 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    Insufficient amount
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Digital Payment Info */}
          {(paymentMethod === 'GCASH' || paymentMethod === 'PAYAMYA') && (
            <Card className="bg-accent/5 border-accent/20">
              <CardContent className="pt-6">
                <p className="text-sm text-foreground">
                  {paymentMethod === 'GCASH' ? 'GCash' : 'PayMaya'} payment will be processed.
                  Please confirm payment receipt with the customer.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Credit Payment Info */}
          {paymentMethod === 'CREDIT' && (
            <Card className="bg-accent/5 border-accent/20">
              <CardContent className="pt-6">
                <p className="text-sm text-foreground">
                  This sale will be added to the customer's credit account.
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || (!isValidPayment && paymentMethod === 'CASH')}
          >
            {isLoading ? 'Processing...' : 'Confirm Payment'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
