'use client';

import { useState, useEffect } from 'react';
import type { Product } from '@/types';
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
import { generateSKU } from '@/lib/formatting';
import { useProducts } from '@/hooks/usePOS';
import { BarcodeScanner } from './BarcodeScanner';

interface ProductFormProps {
  product?: Product;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (product: Product) => Promise<void>;
  isLoading?: boolean;
}

export function ProductForm({
  product,
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}: ProductFormProps) {
  const { products } = useProducts();
  const [formData, setFormData] = useState<Product>(
    product || {
      id: crypto.randomUUID(),
      sku: '',
      barcode: '',
      name: '',
      category: '',
      price: 0,
      cost: 0,
      stock: 0,
      reorderLevel: 5,
      isActive: true,
      createdAt: Date.now(),
    }
  );
  const [useScannerForBarcode, setUseScannerForBarcode] = useState(false);

  // Auto-generate SKU when product name changes (only for new products)
  useEffect(() => {
    if (!product && formData.name.trim()) {
      const existingSKUs = products.map((p) => p.sku);
      const newSKU = generateSKU(formData.name, existingSKUs);
      setFormData((prev) => ({ ...prev, sku: newSKU }));
    }
  }, [formData.name, product, products]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSubmit(formData);
      if (!product) {
        setFormData({
          id: crypto.randomUUID(),
          sku: '',
          barcode: '',
          name: '',
          category: '',
          price: 0,
          cost: 0,
          stock: 0,
          reorderLevel: 5,
          isActive: true,
          createdAt: Date.now(),
        });
      }
      setUseScannerForBarcode(false);
      onClose();
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const handleBarcodeScan = (barcode: string) => {
    setFormData({ ...formData, barcode });
    setUseScannerForBarcode(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {product ? 'Edit Product' : 'Add New Product'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <FieldGroup>
            <Field>
              <FieldLabel>Product Name *</FieldLabel>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g., Milo Powder 400g"
                required
              />
            </Field>
          </FieldGroup>

          <FieldGroup>
            <Field>
              <FieldLabel>SKU * {!product && <span className="text-xs text-muted-foreground">(auto-generated)</span>}</FieldLabel>
              <Input
                value={formData.sku}
                onChange={(e) =>
                  setFormData({ ...formData, sku: e.target.value })
                }
                placeholder="e.g., milopowder"
                required
                disabled={!product}
                className="disabled:opacity-60"
              />
            </Field>
          </FieldGroup>

          <FieldGroup>
            <Field>
              <FieldLabel>Barcode (Optional)</FieldLabel>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    value={formData.barcode}
                    onChange={(e) =>
                      setFormData({ ...formData, barcode: e.target.value })
                    }
                    placeholder="e.g., 9555555001234"
                    className="flex-1"
                    disabled={useScannerForBarcode}
                  />
                  <Button
                    type="button"
                    variant={useScannerForBarcode ? 'default' : 'outline'}
                    onClick={() => setUseScannerForBarcode(!useScannerForBarcode)}
                    className="px-3"
                  >
                    {useScannerForBarcode ? 'Scanning' : 'Scan'}
                  </Button>
                </div>
                {useScannerForBarcode && (
                  <BarcodeScanner
                    onScan={handleBarcodeScan}
                    isActive={isOpen && useScannerForBarcode}
                  />
                )}
              </div>
            </Field>
          </FieldGroup>

          <FieldGroup>
            <Field>
              <FieldLabel>Category</FieldLabel>
              <Input
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                placeholder="e.g., Beverages, Snacks, etc."
              />
            </Field>
          </FieldGroup>

          <div className="grid grid-cols-2 gap-4">
            <FieldGroup>
              <Field>
                <FieldLabel>Cost (₱) *</FieldLabel>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.cost}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      cost: parseFloat(e.target.value) || 0,
                    })
                  }
                  placeholder="0.00"
                  required
                />
              </Field>
            </FieldGroup>

            <FieldGroup>
              <Field>
                <FieldLabel>Selling Price (₱) *</FieldLabel>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      price: parseFloat(e.target.value) || 0,
                    })
                  }
                  placeholder="0.00"
                  required
                />
              </Field>
            </FieldGroup>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FieldGroup>
              <Field>
                <FieldLabel>Stock *</FieldLabel>
                <Input
                  type="number"
                  value={formData.stock}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      stock: parseInt(e.target.value, 10) || 0,
                    })
                  }
                  placeholder="0"
                  required
                />
              </Field>
            </FieldGroup>

            <FieldGroup>
              <Field>
                <FieldLabel>Reorder Level</FieldLabel>
                <Input
                  type="number"
                  value={formData.reorderLevel}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      reorderLevel: parseInt(e.target.value, 10) || 5,
                    })
                  }
                  placeholder="5"
                />
              </Field>
            </FieldGroup>
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
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : product ? 'Update' : 'Add'} Product
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
