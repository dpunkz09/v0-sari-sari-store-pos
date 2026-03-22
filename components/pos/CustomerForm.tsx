'use client';

import { useState } from 'react';
import type { Customer } from '@/types';
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
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field';

interface CustomerFormProps {
  customer?: Customer;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (customer: Customer) => Promise<void>;
  isLoading?: boolean;
}

export function CustomerForm({
  customer,
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}: CustomerFormProps) {
  const [formData, setFormData] = useState<Customer>(
    customer || {
      id: crypto.randomUUID(),
      name: '',
      phone: '',
      address: '',
      email: '',
      creditBalance: 0,
      loyaltyPoints: 0,
      preferredPayment: 'CASH',
      createdAt: Date.now(),
    }
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSubmit(formData);
      if (!customer) {
        setFormData({
          id: crypto.randomUUID(),
          name: '',
          phone: '',
          address: '',
          email: '',
          creditBalance: 0,
          loyaltyPoints: 0,
          preferredPayment: 'CASH',
          createdAt: Date.now(),
        });
      }
      onClose();
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {customer ? 'Edit Customer' : 'Add New Customer'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FieldGroup>
            <Field>
              <FieldLabel>Full Name *</FieldLabel>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g., Juan Dela Cruz"
                required
              />
            </Field>
          </FieldGroup>

          <FieldGroup>
            <Field>
              <FieldLabel>Phone Number</FieldLabel>
              <Input
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder="e.g., 09123456789"
              />
            </Field>
          </FieldGroup>

          <FieldGroup>
            <Field>
              <FieldLabel>Email</FieldLabel>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="e.g., juan@example.com"
              />
            </Field>
          </FieldGroup>

          <FieldGroup>
            <Field>
              <FieldLabel>Address</FieldLabel>
              <Input
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                placeholder="e.g., 123 Main St"
              />
            </Field>
          </FieldGroup>

          <FieldGroup>
            <Field>
              <FieldLabel>Preferred Payment Method</FieldLabel>
              <select
                value={formData.preferredPayment}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    preferredPayment: e.target.value as any,
                  })
                }
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
              >
                <option value="CASH">Cash</option>
                <option value="GCASH">GCash</option>
                <option value="PAYAMYA">PayMaya</option>
                <option value="CREDIT">Credit</option>
              </select>
            </Field>
          </FieldGroup>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : customer ? 'Update' : 'Add'} Customer
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
