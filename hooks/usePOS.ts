'use client';

import { useEffect, useState, useCallback } from 'react';
import { db } from '@/lib/db';
import type { Product, Customer, Transaction, Promotion, CartItem, PaymentMethod } from '@/types';

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    async function init() {
      setLoading(true);
      try {
        await db.init();
        setInitialized(true);
        const items = await db.getAllProducts();
        setProducts(items);
      } catch (error) {
        console.error('Error loading products:', error);
        setInitialized(true);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  const addProduct = useCallback(async (product: Product) => {
    try {
      if (!initialized) await db.init();
      await db.addProduct(product);
      setProducts((prev) => [...prev, product]);
    } catch (error) {
      console.error('Error adding product:', error);
      throw error;
    }
  }, [initialized]);

  const updateProduct = useCallback(async (product: Product) => {
    try {
      if (!initialized) await db.init();
      await db.updateProduct(product);
      setProducts((prev) => prev.map((p) => (p.id === product.id ? product : p)));
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  }, [initialized]);

  const deleteProduct = useCallback(async (id: string) => {
    try {
      if (!initialized) await db.init();
      await db.deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }, [initialized]);

  const getProductByBarcode = useCallback(async (barcode: string) => {
    try {
      if (!initialized) await db.init();
      return await db.getProductByBarcode(barcode);
    } catch (error) {
      console.error('Error getting product by barcode:', error);
      return undefined;
    }
  }, [initialized]);

  return {
    products,
    loading,
    addProduct,
    updateProduct,
    deleteProduct,
    getProductByBarcode,
  };
}

export function useCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    async function init() {
      setLoading(true);
      try {
        await db.init();
        setInitialized(true);
        const items = await db.getAllCustomers();
        setCustomers(items);
      } catch (error) {
        console.error('Error loading customers:', error);
        setInitialized(true);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  const addCustomer = useCallback(async (customer: Customer) => {
    try {
      if (!initialized) await db.init();
      await db.addCustomer(customer);
      setCustomers((prev) => [...prev, customer]);
    } catch (error) {
      console.error('Error adding customer:', error);
      throw error;
    }
  }, [initialized]);

  const updateCustomer = useCallback(async (customer: Customer) => {
    try {
      if (!initialized) await db.init();
      await db.updateCustomer(customer);
      setCustomers((prev) => prev.map((c) => (c.id === customer.id ? customer : c)));
    } catch (error) {
      console.error('Error updating customer:', error);
      throw error;
    }
  }, [initialized]);

  return {
    customers,
    loading,
    addCustomer,
    updateCustomer,
  };
}

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    async function init() {
      setLoading(true);
      try {
        await db.init();
        setInitialized(true);
        const items = await db.getAllTransactions();
        setTransactions(items);
      } catch (error) {
        console.error('Error loading transactions:', error);
        setInitialized(true);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  const addTransaction = useCallback(async (transaction: Transaction) => {
    try {
      if (!initialized) await db.init();
      await db.addTransaction(transaction);
      setTransactions((prev) => [...prev, transaction]);
    } catch (error) {
      console.error('Error adding transaction:', error);
      throw error;
    }
  }, [initialized]);

  const getTransactionsByDateRange = useCallback(
    async (startDate: number, endDate: number) => {
      try {
        if (!initialized) await db.init();
        return await db.getTransactionsByDate(startDate, endDate);
      } catch (error) {
        console.error('Error getting transactions by date range:', error);
        return [];
      }
    },
    [initialized]
  );

  return {
    transactions,
    loading,
    addTransaction,
    getTransactionsByDateRange,
  };
}

export function usePromotions() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    async function init() {
      setLoading(true);
      try {
        await db.init();
        setInitialized(true);
        const items = await db.getActivePromotions();
        setPromotions(items);
      } catch (error) {
        console.error('Error loading promotions:', error);
        setInitialized(true);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  const addPromotion = useCallback(async (promotion: Promotion) => {
    try {
      if (!initialized) await db.init();
      await db.addPromotion(promotion);
      setPromotions((prev) => [...prev, promotion]);
    } catch (error) {
      console.error('Error adding promotion:', error);
      throw error;
    }
  }, [initialized]);

  const updatePromotion = useCallback(async (promotion: Promotion) => {
    try {
      if (!initialized) await db.init();
      await db.updatePromotion(promotion);
      setPromotions((prev) => prev.map((p) => (p.id === promotion.id ? promotion : p)));
    } catch (error) {
      console.error('Error updating promotion:', error);
      throw error;
    }
  }, [initialized]);

  return {
    promotions,
    loading,
    addPromotion,
    updatePromotion,
  };
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = useCallback((item: CartItem) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === item.productId);
      if (existing) {
        return prev.map((i) =>
          i.productId === item.productId
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      }
      return [...prev, item];
    });
  }, []);

  const updateItem = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
    } else {
      setItems((prev) =>
        prev.map((i) =>
          i.productId === productId ? { ...i, quantity } : i
        )
      );
    }
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  return {
    items,
    addItem,
    updateItem,
    removeItem,
    clearCart,
  };
}
