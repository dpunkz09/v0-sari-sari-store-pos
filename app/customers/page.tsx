'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CustomerForm } from '@/components/pos/CustomerForm';
import { CustomerList } from '@/components/pos/CustomerList';
import { useCustomers } from '@/hooks/usePOS';
import type { Customer } from '@/types';

export default function CustomersPage() {
  const { customers, addCustomer, updateCustomer } = useCustomers();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const filteredCustomers = customers.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddCustomer = async (customer: Customer) => {
    setIsLoading(true);
    try {
      await addCustomer(customer);
      setIsFormOpen(false);
      setSelectedCustomer(undefined);
    } catch (error) {
      console.error('Error adding customer:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateCustomer = async (customer: Customer) => {
    setIsLoading(true);
    try {
      await updateCustomer(customer);
      setIsFormOpen(false);
      setSelectedCustomer(undefined);
    } catch (error) {
      console.error('Error updating customer:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClick = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsFormOpen(true);
  };

  const handleAddClick = () => {
    setSelectedCustomer(undefined);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedCustomer(undefined);
  };

  const handleFormSubmit = (customer: Customer) => {
    if (selectedCustomer) {
      return handleUpdateCustomer(customer);
    }
    return handleAddCustomer(customer);
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
                <h1 className="text-2xl font-bold text-foreground">Customers</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Manage customer profiles and loyalty
                </p>
              </div>
            </div>
            <Button onClick={handleAddClick} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Customer
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
                  placeholder="Search by name or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="text-sm text-muted-foreground">
                Total: <span className="font-semibold">{filteredCustomers.length}</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <CustomerList
              customers={filteredCustomers}
              onEdit={handleEditClick}
              onDelete={() => {}}
              isLoading={isLoading}
            />
          </CardContent>
        </Card>
      </main>

      {/* Customer Form Dialog */}
      <CustomerForm
        customer={selectedCustomer}
        isOpen={isFormOpen}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        isLoading={isLoading}
      />
    </div>
  );
}
