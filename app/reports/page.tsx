'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTransactions, useProducts } from '@/hooks/usePOS';
import { getTodayStart, getTodayEnd, getWeekStart, getMonthStart, formatCurrency, formatDate } from '@/lib/formatting';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function ReportsPage() {
  const { transactions } = useTransactions();
  const { products } = useProducts();

  const now = Date.now();
  const todayStart = getTodayStart();
  const todayEnd = getTodayEnd();
  const weekStart = getWeekStart();
  const monthStart = getMonthStart();

  const todayTransactions = transactions.filter(
    (t) => t.transactionDate >= todayStart && t.transactionDate <= todayEnd
  );
  const weekTransactions = transactions.filter(
    (t) => t.transactionDate >= weekStart && t.transactionDate <= now
  );
  const monthTransactions = transactions.filter(
    (t) => t.transactionDate >= monthStart && t.transactionDate <= now
  );

  const todayRevenue = todayTransactions.reduce((sum, t) => sum + t.total, 0);
  const weekRevenue = weekTransactions.reduce((sum, t) => sum + t.total, 0);
  const monthRevenue = monthTransactions.reduce((sum, t) => sum + t.total, 0);

  const paymentBreakdown = {
    CASH: todayTransactions.filter((t) => t.paymentMethod === 'CASH').length,
    GCASH: todayTransactions.filter((t) => t.paymentMethod === 'GCASH').length,
    PAYAMYA: todayTransactions.filter((t) => t.paymentMethod === 'PAYAMYA').length,
    CREDIT: todayTransactions.filter((t) => t.paymentMethod === 'CREDIT').length,
  };

  const paymentData = Object.entries(paymentBreakdown)
    .filter(([, count]) => count > 0)
    .map(([method, count]) => ({
      name: method,
      value: count,
    }));

  const topProducts = products
    .map((p) => ({
      name: p.name,
      sales: todayTransactions.reduce((sum, t) => {
        const item = t.items.find((i) => i.productId === p.id);
        return sum + (item?.quantity || 0);
      }, 0),
    }))
    .filter((p) => p.sales > 0)
    .sort((a, b) => b.sales - a.sales)
    .slice(0, 10);

  const COLORS = ['#2ea370', '#06d9c0', '#f59e0b', '#ef4444'];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Sales Reports</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                View analytics and transaction trends
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-8">
        {/* Key Metrics */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Today's Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-primary">{formatCurrency(todayRevenue)}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {todayTransactions.length} transactions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Week Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-accent">{formatCurrency(weekRevenue)}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {weekTransactions.length} transactions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Month Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-secondary">{formatCurrency(monthRevenue)}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {monthTransactions.length} transactions
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Payment Methods */}
          {paymentData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Today's Payment Methods</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={paymentData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {paymentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Top Products */}
          {topProducts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Top Selling Products Today</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={topProducts}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="sales" fill="#2ea370" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Recent Transactions */}
        {todayTransactions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Today's Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-semibold">Receipt #</th>
                      <th className="text-left py-3 px-4 font-semibold">Time</th>
                      <th className="text-left py-3 px-4 font-semibold">Items</th>
                      <th className="text-left py-3 px-4 font-semibold">Method</th>
                      <th className="text-right py-3 px-4 font-semibold">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {todayTransactions.slice(-10).reverse().map((t) => (
                      <tr key={t.id} className="border-b border-border hover:bg-muted/50">
                        <td className="py-3 px-4">{t.receiptNumber}</td>
                        <td className="py-3 px-4">
                          {new Date(t.createdAt).toLocaleTimeString('en-PH')}
                        </td>
                        <td className="py-3 px-4">{t.items.length}</td>
                        <td className="py-3 px-4">{t.paymentMethod}</td>
                        <td className="py-3 px-4 text-right font-semibold">
                          {formatCurrency(t.total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
