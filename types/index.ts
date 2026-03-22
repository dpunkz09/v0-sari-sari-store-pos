// Product Types
export interface Product {
  id: string;
  sku: string;
  barcode: string;
  name: string;
  category: string;
  price: number;
  cost: number;
  stock: number;
  reorderLevel: number;
  isActive: boolean;
  createdAt: number;
}

// Customer Types
export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  email?: string;
  creditBalance: number;
  loyaltyPoints: number;
  preferredPayment: 'CASH' | 'GCASH' | 'PAYAMYA' | 'CREDIT';
  createdAt: number;
  lastPurchase?: number;
}

// Cart Item Type
export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  discount: number;
}

// Payment Method Type
export type PaymentMethod = 'CASH' | 'GCASH' | 'PAYAMYA' | 'CREDIT';

// Transaction Type
export interface Transaction {
  id: string;
  transactionDate: number;
  customerId?: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  totalDiscount: number;
  total: number;
  paymentMethod: PaymentMethod;
  amountTendered: number;
  change: number;
  receiptNumber: string;
  notes?: string;
  createdAt: number;
}

// Promotion Type
export type PromotionType = 'PERCENTAGE' | 'FIXED' | 'BOGO' | 'BULK';

export interface Promotion {
  id: string;
  name: string;
  type: PromotionType;
  value: number;
  condition?: string;
  startDate: number;
  endDate: number;
  isActive: boolean;
  createdAt: number;
}

// Store Settings Type
export interface StoreSettings {
  storeName: string;
  location: string;
  phone: string;
  taxRate: number;
  receiptTemplate: string;
  theme: 'light' | 'dark';
}

// Sales Summary Type
export interface SalesSummary {
  date: string;
  totalRevenue: number;
  totalTransactions: number;
  averageSale: number;
  paymentBreakdown: {
    cash: number;
    gcash: number;
    payamya: number;
    credit: number;
  };
}
