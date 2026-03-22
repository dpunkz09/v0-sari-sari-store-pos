'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field';
import { usePromotions } from '@/hooks/usePOS';
import type { Promotion } from '@/types';
import { formatDate } from '@/lib/formatting';

export default function PromotionsPage() {
  const { promotions, addPromotion, updatePromotion } = usePromotions();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState<Promotion>({
    id: '',
    name: '',
    type: 'PERCENTAGE',
    value: 0,
    startDate: Date.now(),
    endDate: Date.now() + 7 * 24 * 60 * 60 * 1000,
    isActive: true,
    createdAt: Date.now(),
  });

  const handleAddClick = () => {
    setSelectedPromotion(undefined);
    setFormData({
      id: crypto.randomUUID(),
      name: '',
      type: 'PERCENTAGE',
      value: 0,
      startDate: Date.now(),
      endDate: Date.now() + 7 * 24 * 60 * 60 * 1000,
      isActive: true,
      createdAt: Date.now(),
    });
    setIsFormOpen(true);
  };

  const handleEditClick = (promo: Promotion) => {
    setSelectedPromotion(promo);
    setFormData(promo);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (selectedPromotion) {
        await updatePromotion(formData);
      } else {
        await addPromotion(formData);
      }
      setIsFormOpen(false);
    } catch (error) {
      console.error('Error saving promotion:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Promotions</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Create and manage discounts
                </p>
              </div>
            </div>
            <Button onClick={handleAddClick} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Promotion
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="grid gap-4">
          {promotions.length === 0 ? (
            <Card>
              <CardContent className="pt-12 pb-12 text-center">
                <p className="text-muted-foreground">No promotions yet. Create your first promotion!</p>
              </CardContent>
            </Card>
          ) : (
            promotions.map((promo) => (
              <Card key={promo.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-foreground">{promo.name}</h3>
                        <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-primary/10 text-primary">
                          {promo.type}
                        </span>
                        {promo.isActive && (
                          <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-green-100 text-green-700">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Discount Value: {promo.type === 'PERCENTAGE' ? promo.value + '%' : '₱' + promo.value}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(promo.startDate)} to {formatDate(promo.endDate)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditClick(promo)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>

      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedPromotion ? 'Edit Promotion' : 'Add New Promotion'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <FieldGroup>
              <Field>
                <FieldLabel>Promotion Name *</FieldLabel>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., Summer Sale"
                  required
                />
              </Field>
            </FieldGroup>

            <FieldGroup>
              <Field>
                <FieldLabel>Promotion Type *</FieldLabel>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value as any })
                  }
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                >
                  <option value="PERCENTAGE">Percentage Discount</option>
                  <option value="FIXED">Fixed Amount</option>
                  <option value="BOGO">Buy One Get One</option>
                  <option value="BULK">Bulk Purchase</option>
                </select>
              </Field>
            </FieldGroup>

            <FieldGroup>
              <Field>
                <FieldLabel>
                  Discount Value {formData.type === 'PERCENTAGE' ? '(%)' : '(₱)'} *
                </FieldLabel>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.value}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      value: parseFloat(e.target.value) || 0,
                    })
                  }
                  placeholder="0"
                  required
                />
              </Field>
            </FieldGroup>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsFormOpen(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : selectedPromotion ? 'Update' : 'Create'} Promotion
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
