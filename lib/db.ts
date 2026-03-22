import type { Product, Customer, Transaction, Promotion, StoreSettings } from '@/types';

const DB_NAME = 'SariSariPOS';
const DB_VERSION = 1;

export class Database {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Products store
        if (!db.objectStoreNames.contains('products')) {
          const productStore = db.createObjectStore('products', { keyPath: 'id' });
          productStore.createIndex('barcode', 'barcode', { unique: true });
          productStore.createIndex('sku', 'sku', { unique: true });
          productStore.createIndex('category', 'category', { unique: false });
        }

        // Customers store
        if (!db.objectStoreNames.contains('customers')) {
          const customerStore = db.createObjectStore('customers', { keyPath: 'id' });
          customerStore.createIndex('phone', 'phone', { unique: false });
          customerStore.createIndex('name', 'name', { unique: false });
        }

        // Transactions store
        if (!db.objectStoreNames.contains('transactions')) {
          const transactionStore = db.createObjectStore('transactions', { keyPath: 'id' });
          transactionStore.createIndex('transactionDate', 'transactionDate', { unique: false });
          transactionStore.createIndex('customerId', 'customerId', { unique: false });
          transactionStore.createIndex('receiptNumber', 'receiptNumber', { unique: true });
        }

        // Promotions store
        if (!db.objectStoreNames.contains('promotions')) {
          const promotionStore = db.createObjectStore('promotions', { keyPath: 'id' });
          promotionStore.createIndex('isActive', 'isActive', { unique: false });
        }

        // Settings store
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }
      };
    });
  }

  // Product operations
  async addProduct(product: Product): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction('products', 'readwrite');
      const store = transaction.objectStore('products');
      const request = store.add(product);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async updateProduct(product: Product): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction('products', 'readwrite');
      const store = transaction.objectStore('products');
      const request = store.put(product);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async getProduct(id: string): Promise<Product | undefined> {
    if (!this.db) throw new Error('Database not initialized');
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction('products', 'readonly');
      const store = transaction.objectStore('products');
      const request = store.get(id);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async getProductByBarcode(barcode: string): Promise<Product | undefined> {
    if (!this.db) throw new Error('Database not initialized');
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction('products', 'readonly');
      const store = transaction.objectStore('products');
      const index = store.index('barcode');
      const request = index.get(barcode);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async getAllProducts(): Promise<Product[]> {
    if (!this.db) throw new Error('Database not initialized');
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction('products', 'readonly');
      const store = transaction.objectStore('products');
      const request = store.getAll();
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async deleteProduct(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction('products', 'readwrite');
      const store = transaction.objectStore('products');
      const request = store.delete(id);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  // Customer operations
  async addCustomer(customer: Customer): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction('customers', 'readwrite');
      const store = transaction.objectStore('customers');
      const request = store.add(customer);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async updateCustomer(customer: Customer): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction('customers', 'readwrite');
      const store = transaction.objectStore('customers');
      const request = store.put(customer);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async getCustomer(id: string): Promise<Customer | undefined> {
    if (!this.db) throw new Error('Database not initialized');
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction('customers', 'readonly');
      const store = transaction.objectStore('customers');
      const request = store.get(id);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async getAllCustomers(): Promise<Customer[]> {
    if (!this.db) throw new Error('Database not initialized');
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction('customers', 'readonly');
      const store = transaction.objectStore('customers');
      const request = store.getAll();
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  // Transaction operations
  async addTransaction(transaction: Transaction): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    return new Promise((resolve, reject) => {
      const txn = this.db!.transaction('transactions', 'readwrite');
      const store = txn.objectStore('transactions');
      const request = store.add(transaction);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async getTransaction(id: string): Promise<Transaction | undefined> {
    if (!this.db) throw new Error('Database not initialized');
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction('transactions', 'readonly');
      const store = transaction.objectStore('transactions');
      const request = store.get(id);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async getAllTransactions(): Promise<Transaction[]> {
    if (!this.db) throw new Error('Database not initialized');
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction('transactions', 'readonly');
      const store = transaction.objectStore('transactions');
      const request = store.getAll();
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async getTransactionsByDate(startDate: number, endDate: number): Promise<Transaction[]> {
    if (!this.db) throw new Error('Database not initialized');
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction('transactions', 'readonly');
      const store = transaction.objectStore('transactions');
      const index = store.index('transactionDate');
      const range = IDBKeyRange.bound(startDate, endDate);
      const request = index.getAll(range);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  // Promotion operations
  async addPromotion(promotion: Promotion): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction('promotions', 'readwrite');
      const store = transaction.objectStore('promotions');
      const request = store.add(promotion);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async updatePromotion(promotion: Promotion): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction('promotions', 'readwrite');
      const store = transaction.objectStore('promotions');
      const request = store.put(promotion);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async getActivePromotions(): Promise<Promotion[]> {
    if (!this.db) throw new Error('Database not initialized');
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction('promotions', 'readonly');
      const store = transaction.objectStore('promotions');
      const index = store.index('isActive');
      const request = index.getAll(true);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const now = Date.now();
        const active = request.result.filter(
          (p) => p.startDate <= now && p.endDate >= now
        );
        resolve(active);
      };
    });
  }

  // Settings operations
  async saveSetting(key: string, value: unknown): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction('settings', 'readwrite');
      const store = transaction.objectStore('settings');
      const request = store.put({ key, value });
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async getSetting(key: string): Promise<unknown> {
    if (!this.db) throw new Error('Database not initialized');
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction('settings', 'readonly');
      const store = transaction.objectStore('settings');
      const request = store.get(key);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result?.value);
    });
  }
}

export const db = new Database();
