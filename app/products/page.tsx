'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProductForm } from '@/components/pos/ProductForm';
import { ProductList } from '@/components/pos/ProductList';
import { useProducts } from '@/hooks/usePOS';
import type { Product } from '@/types';

export default function ProductsPage() {
  const { products, addProduct, updateProduct, deleteProduct } = useProducts();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.barcode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddProduct = async (product: Product) => {
    setIsLoading(true);
    try {
      await addProduct(product);
      setIsFormOpen(false);
      setSelectedProduct(undefined);
    } catch (error) {
      console.error('Error adding product:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProduct = async (product: Product) => {
    setIsLoading(true);
    try {
      await updateProduct(product);
      setIsFormOpen(false);
      setSelectedProduct(undefined);
    } catch (error) {
      console.error('Error updating product:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    setIsLoading(true);
    try {
      await deleteProduct(productId);
    } catch (error) {
      console.error('Error deleting product:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClick = (product: Product) => {
    setSelectedProduct(product);
    setIsFormOpen(true);
  };

  const handleAddClick = () => {
    setSelectedProduct(undefined);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedProduct(undefined);
  };

  const handleFormSubmit = (product: Product) => {
    if (selectedProduct) {
      return handleUpdateProduct(product);
    }
    return handleAddProduct(product);
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
                <h1 className="text-2xl font-bold text-foreground">Products</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Manage your product inventory
                </p>
              </div>
            </div>
            <Button onClick={handleAddClick} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Product
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, SKU, or barcode..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="text-sm text-muted-foreground">
                Total: <span className="font-semibold">{filteredProducts.length}</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ProductList
              products={filteredProducts}
              onEdit={handleEditClick}
              onDelete={handleDeleteProduct}
              isLoading={isLoading}
            />
          </CardContent>
        </Card>
      </main>

      {/* Product Form Dialog */}
      <ProductForm
        product={selectedProduct}
        isOpen={isFormOpen}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        isLoading={isLoading}
      />
    </div>
  );
}
