'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Printer, Eye, Smartphone, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarcodeScanner } from '@/components/pos/BarcodeScanner';
import { ShoppingCart } from '@/components/pos/ShoppingCart';
import { PaymentProcessor } from '@/components/pos/PaymentProcessor';
import { ReceiptModal } from '@/components/pos/ReceiptModal';
import { useProducts, useCart, useCustomers, useTransactions } from '@/hooks/usePOS';
import { generateReceiptNumber, generateReceiptHTML, formatCurrency, getTodayStart, getTodayEnd, encodeToBase64 } from '@/lib/formatting';
import { calculateSubtotal, calculateDiscount, calculateTax, calculateTotal } from '@/lib/calculations';
import type { Product, Transaction, CartItem, PaymentMethod } from '@/types';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

export default function CheckoutPage() {
  const { products } = useProducts();
  const { customers } = useCustomers();
  const { items, addItem, updateItem, removeItem, clearCart } = useCart();
  const { addTransaction } = useTransactions();

  const [showScanner, setShowScanner] = useState(true);
  const [showPayment, setShowPayment] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [lastReceipt, setLastReceipt] = useState<string | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const [showProductGrid, setShowProductGrid] = useState(false);

  // Detect mobile
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 1024);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const subtotal = calculateSubtotal(items);
  const totalDiscount = calculateDiscount(items) + discountAmount;
  const tax = calculateTax(subtotal - totalDiscount, 0.12);
  const total = calculateTotal(subtotal, tax, totalDiscount);

  const filteredProducts = products.filter(
    (p) =>
      p.isActive &&
      (p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleBarcodeScan = async (barcode: string) => {
    const product = await (async () => {
      const p = products.find((prod) => prod.barcode === barcode);
      return p;
    })();

    if (product && product.stock > 0) {
      addItem({
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        discount: 0,
      });
    } else if (!product) {
      alert('Product not found: ' + barcode);
    } else {
      alert('Product out of stock: ' + product.name);
    }
  };

  const handleAddProduct = (product: Product) => {
    if (product.stock > 0) {
      const existingItem = items.find((i) => i.productId === product.id);
      const totalQuantity = (existingItem?.quantity || 0) + 1;

      if (totalQuantity <= product.stock) {
        addItem({
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
          discount: 0,
        });
        setSearchTerm('');
      } else {
        alert('Not enough stock available');
      }
    } else {
      alert('Product out of stock');
    }
  };

  const handlePayment = async (payment: {
    method: PaymentMethod;
    amountTendered: number;
    change: number;
  }) => {
    if (items.length === 0) {
      alert('Cart is empty');
      return;
    }

    setIsProcessing(true);
    try {
      const receiptNumber = generateReceiptNumber();
      const transaction: Transaction = {
        id: crypto.randomUUID(),
        transactionDate: Date.now(),
        customerId: selectedCustomerId || undefined,
        items,
        subtotal,
        tax,
        totalDiscount,
        total,
        paymentMethod: payment.method,
        amountTendered: payment.amountTendered,
        change: payment.change,
        receiptNumber,
        createdAt: Date.now(),
      };

      await addTransaction(transaction);

      // Generate and store receipt
      const receipt = generateReceiptHTML(transaction, 'Sari-Sari Store');
      setLastReceipt(receipt);
      setShowReceipt(true); // Show receipt modal

      // Clear cart
      clearCart();
      setSelectedCustomerId('');
      setDiscountAmount(0);
      setShowPayment(false);
    } catch (error) {
      console.error('Payment error:', error);
      alert('Error processing payment. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePrintReceipt = () => {
    if (!lastReceipt) return;
    const printWindow = window.open('', '', 'height=400,width=600');
    if (printWindow) {
      printWindow.document.write(lastReceipt);
      printWindow.document.close();
      printWindow.print();
    }
  };

  // Mobile layout
  if (isMobileView) {
    return (
      <div className="min-h-screen bg-background pb-24">
        {/* Header */}
        <header className="border-b border-border bg-card sticky top-0 z-40 p-3">
          <div className="flex items-center justify-between gap-2">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon" className="h-10 w-10">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-lg font-bold text-foreground flex-1">POS</h1>
            {lastReceipt && (
              <Button 
                onClick={handlePrintReceipt} 
                variant="outline" 
                size="icon"
                className="h-10 w-10"
              >
                <Printer className="h-4 w-4" />
              </Button>
            )}
          </div>
        </header>

        {/* Main Content - Mobile Tabs */}
        <main className="p-3 space-y-4">
          {/* Scanner - Always Visible */}
          {showScanner && (
            <BarcodeScanner
              onScan={handleBarcodeScan}
              isActive={true}
            />
          )}

          {/* Product Grid Tab */}
          {showProductGrid && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Quick Add</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 h-9 text-sm"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2 max-h-60 overflow-y-auto">
                  {filteredProducts.slice(0, 12).map((product) => (
                    <Button
                      key={product.id}
                      variant="outline"
                      onClick={() => handleAddProduct(product)}
                      disabled={product.stock === 0}
                      className="h-auto flex flex-col items-start gap-1 p-2 text-left"
                    >
                      <span className="font-semibold text-xs line-clamp-2">
                        {product.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatCurrency(product.price)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {product.stock}
                      </span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Cart Tab */}
          {items.length > 0 && (
            <div className="space-y-3">
              <ShoppingCart
                items={items}
                onUpdateItem={updateItem}
                onRemoveItem={removeItem}
                taxRate={0.12}
                totalDiscount={discountAmount}
              />

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <select
                    value={selectedCustomerId}
                    onChange={(e) => setSelectedCustomerId(e.target.value)}
                    className="w-full px-2 py-2 border border-border rounded-lg bg-background text-foreground text-xs"
                  >
                    <option value="">Walk-in</option>
                    {customers.map((customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.name}
                      </option>
                    ))}
                  </select>

                  <div>
                    <label className="text-xs font-medium text-foreground block mb-1">
                      Discount (₱)
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      value={discountAmount}
                      onChange={(e) =>
                        setDiscountAmount(parseFloat(e.target.value) || 0)
                      }
                      placeholder="0.00"
                      className="h-9 text-sm"
                    />
                  </div>
                </CardContent>
              </Card>

              <Button
                onClick={() => setShowPayment(true)}
                disabled={items.length === 0 || isProcessing}
                className="w-full py-4 text-base font-semibold"
              >
                Pay (₱{formatCurrency(total).replace('₱', '')})
              </Button>
            </div>
          )}

          {/* Empty Cart */}
          {items.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <Smartphone className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                <p className="text-xs text-muted-foreground mb-3">Scan barcodes or add products</p>
                <Button 
                  onClick={() => setShowProductGrid(!showProductGrid)}
                  variant="outline"
                  className="w-full"
                >
                  {showProductGrid ? 'Hide Products' : 'Show Products'}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Last Receipt */}
            {lastReceipt && (
              <Button
                onClick={() => window.open('data:text/html;base64,' + encodeToBase64(lastReceipt))}
                variant="secondary"
                className="w-full gap-2 text-sm"
              >
                <Eye className="h-4 w-4" />
                View Last Receipt
              </Button>
            )}
        </main>

        {/* Mobile Footer - Quick Actions */}
        <footer className="fixed bottom-0 left-0 right-0 border-t border-border bg-card p-2">
          <div className="flex gap-2">
            <Button
              onClick={() => setShowProductGrid(!showProductGrid)}
              variant={showProductGrid ? 'default' : 'outline'}
              className="flex-1 h-12 text-xs"
            >
              Products
            </Button>
            {items.length > 0 && (
              <>
                <Button
                  onClick={() => {
                    clearCart();
                    setSelectedCustomerId('');
                    setDiscountAmount(0);
                  }}
                  variant="outline"
                  className="flex-1 h-12 text-xs"
                  disabled={isProcessing}
                >
                  Clear
                </Button>
                <Link href="/dashboard" className="flex-1">
                  <Button variant="outline" className="w-full h-12 text-xs">
                    <Home className="h-4 w-4" />
                  </Button>
                </Link>
              </>
            )}
          </div>
        </footer>

        {/* Receipt Modal */}
        <ReceiptModal
          receiptHTML={lastReceipt}
          isOpen={showReceipt}
          onClose={() => setShowReceipt(false)}
        />
      </div>
    );
  }

  // Desktop layout
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-40">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <h1 className="text-2xl font-bold text-foreground">Point of Sale</h1>
            </div>
            {lastReceipt && (
              <Button onClick={handlePrintReceipt} variant="outline" className="gap-2">
                <Printer className="h-4 w-4" />
                Print Receipt
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Section - Products */}
          <div className="lg:col-span-2 space-y-6">
            {/* Scanner */}
            {showScanner && (
              <BarcodeScanner
                onScan={handleBarcodeScan}
                isActive={true}
              />
            )}

            {/* Product Search */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Quick Add Products</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {filteredProducts.slice(0, 12).map((product) => (
                    <Button
                      key={product.id}
                      variant="outline"
                      onClick={() => handleAddProduct(product)}
                      disabled={product.stock === 0}
                      className="h-auto flex flex-col items-start gap-1 p-3 text-left"
                    >
                      <span className="font-semibold text-sm line-clamp-2">
                        {product.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatCurrency(product.price)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Stock: {product.stock}
                      </span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Section - Cart & Payment */}
          <div className="space-y-6">
            {/* Cart */}
            <ShoppingCart
              items={items}
              onUpdateItem={updateItem}
              onRemoveItem={removeItem}
              taxRate={0.12}
              totalDiscount={discountAmount}
            />

            {/* Discount & Customer */}
            {items.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Transaction Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground block mb-2">
                      Customer (Optional)
                    </label>
                    <select
                      value={selectedCustomerId}
                      onChange={(e) => setSelectedCustomerId(e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm"
                    >
                      <option value="">Walk-in Customer</option>
                      {customers.map((customer) => (
                        <option key={customer.id} value={customer.id}>
                          {customer.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground block mb-2">
                      Additional Discount (₱)
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      value={discountAmount}
                      onChange={(e) =>
                        setDiscountAmount(parseFloat(e.target.value) || 0)
                      }
                      placeholder="0.00"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="space-y-2">
              <Button
                onClick={() => setShowPayment(true)}
                disabled={items.length === 0 || isProcessing}
                className="w-full py-6 text-lg font-semibold"
              >
                Proceed to Payment
              </Button>
              {items.length > 0 && (
                <Button
                  onClick={() => {
                    clearCart();
                    setSelectedCustomerId('');
                    setDiscountAmount(0);
                  }}
                  variant="outline"
                  className="w-full"
                  disabled={isProcessing}
                >
                  Clear Cart
                </Button>
              )}
            </div>

            {/* Last Receipt Link */}
            {lastReceipt && (
              <Button
                onClick={() => window.open('data:text/html;base64,' + encodeToBase64(lastReceipt))}
                variant="secondary"
                className="w-full gap-2"
              >
                <Eye className="h-4 w-4" />
                View Last Receipt
              </Button>
            )}
          </div>
        </div>
      </main>

      {/* Payment Dialog */}
      <PaymentProcessor
        total={total}
        isOpen={showPayment}
        onClose={() => setShowPayment(false)}
        onSubmit={handlePayment}
        isLoading={isProcessing}
      />

      {/* Receipt Modal */}
      <ReceiptModal
        receiptHTML={lastReceipt}
        isOpen={showReceipt}
        onClose={() => setShowReceipt(false)}
      />
    </div>
  );
}
