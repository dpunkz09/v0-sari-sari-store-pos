'use client';

import Link from 'next/link';
import { ShoppingCart, Package, Users, BarChart3, Tag, Settings, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useProducts, useTransactions, useCustomers } from '@/hooks/usePOS';
import { getTodayStart, getTodayEnd, formatCurrency } from '@/lib/formatting';
import { calculateTotal } from '@/lib/calculations';

export default function Dashboard() {
  const { products } = useProducts();
  const { transactions } = useTransactions();
  const { customers } = useCustomers();

  const todayStart = getTodayStart();
  const todayEnd = getTodayEnd();
  const todayTransactions = transactions.filter(
    (t) => t.transactionDate >= todayStart && t.transactionDate <= todayEnd
  );

  const todayRevenue = todayTransactions.reduce((sum, t) => sum + t.total, 0);
  const lowStockProducts = products.filter((p) => p.stock <= p.reorderLevel && p.isActive);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Sari-Sari POS</h1>
              <p className="mt-1 text-sm text-muted-foreground">Point of Sale System</p>
            </div>
            <Link href="/settings">
              <Button variant="outline" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Today's Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{formatCurrency(todayRevenue)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {todayTransactions.length} transactions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Products
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{products.filter(p => p.isActive).length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {lowStockProducts.length} low stock
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Registered Customers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{customers.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Loyalty members</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Transactions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{transactions.length}</div>
              <p className="text-xs text-muted-foreground mt-1">All time</p>
            </CardContent>
          </Card>
        </div>

        {/* Low Stock Alert */}
        {lowStockProducts.length > 0 && (
          <Card className="mb-8 border-destructive/50 bg-destructive/5">
            <CardHeader>
              <CardTitle className="text-base text-destructive">Low Stock Alert</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-foreground mb-3">
                {lowStockProducts.length} product(s) below reorder level:
              </p>
              <div className="space-y-2">
                {lowStockProducts.slice(0, 5).map((product) => (
                  <div key={product.id} className="flex items-center justify-between text-sm">
                    <span className="text-foreground">{product.name}</span>
                    <span className="text-muted-foreground">
                      {product.stock} / {product.reorderLevel} units
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Access Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Link href="/pos/checkout">
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <ShoppingCart className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">New Sale</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Start a new transaction and process sales
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/products">
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-accent/10 rounded-lg">
                    <Package className="h-6 w-6 text-accent" />
                  </div>
                  <CardTitle className="text-lg">Products</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Manage inventory and product catalog
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/customers">
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-secondary/10 rounded-lg">
                    <Users className="h-6 w-6 text-secondary" />
                  </div>
                  <CardTitle className="text-lg">Customers</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  View and manage customer profiles
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/reports">
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-chart-1/10 rounded-lg">
                    <BarChart3 className="h-6 w-6 text-chart-1" />
                  </div>
                  <CardTitle className="text-lg">Reports</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  View sales analytics and trends
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/promotions">
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-chart-2/10 rounded-lg">
                    <Tag className="h-6 w-6 text-chart-2" />
                  </div>
                  <CardTitle className="text-lg">Promotions</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Create and manage discounts
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/settings">
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-muted rounded-lg">
                    <Settings className="h-6 w-6 text-foreground" />
                  </div>
                  <CardTitle className="text-lg">Settings</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Configure store settings
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Recent Transactions */}
        {todayTransactions.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Today's Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {todayTransactions.slice(-5).reverse().map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between py-3 border-b last:border-0">
                    <div className="flex-1">
                      <p className="font-medium text-foreground">
                        {transaction.receiptNumber}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(transaction.createdAt).toLocaleTimeString('en-PH')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-foreground">
                        {formatCurrency(transaction.total)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {transaction.paymentMethod}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
