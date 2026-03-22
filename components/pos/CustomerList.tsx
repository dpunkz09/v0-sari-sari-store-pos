'use client';

import type { Customer } from '@/types';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Phone, MapPin } from 'lucide-react';
import { formatCurrency } from '@/lib/formatting';
import React from 'react';

interface CustomerListProps {
  customers: Customer[];
  onEdit: (customer: Customer) => void;
  onDelete: (customerId: string) => void;
  isLoading?: boolean;
}

export function CustomerList({
  customers,
  onEdit,
  onDelete,
  isLoading = false,
}: CustomerListProps) {
  const [deleteId, setDeleteId] = React.useState<string | null>(null);

  const customerToDelete = customers.find((c) => c.id === deleteId);

  if (customers.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          No customers yet. Add your first customer to get started.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {customers.map((customer) => (
          <div
            key={customer.id}
            className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
          >
            <div className="flex-1">
              <p className="font-medium text-foreground">{customer.name}</p>
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                {customer.phone && (
                  <div className="flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {customer.phone}
                  </div>
                )}
                {customer.address && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {customer.address}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-4 mt-2 text-xs">
                {customer.creditBalance > 0 && (
                  <span className="text-destructive font-medium">
                    Credit: {formatCurrency(customer.creditBalance)}
                  </span>
                )}
                {customer.loyaltyPoints > 0 && (
                  <span className="text-primary font-medium">
                    Points: {customer.loyaltyPoints}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(customer)}
                disabled={isLoading}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDeleteId(customer.id)}
                disabled={isLoading}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation would go here */}
    </>
  );
}
