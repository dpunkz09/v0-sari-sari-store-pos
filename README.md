# Sari-Sari POS System

A modern, user-friendly Point of Sale system specifically designed for Filipino sari-sari stores. Built with Next.js, React, and local storage (IndexedDB) for offline-first operation.

## Features

### Core POS Functionality
- **Barcode Scanning**: Real-time barcode/QR code scanning with @zxing/library for fast product lookup
- **Manual Product Entry**: Search and select products from inventory when barcode scanning isn't available
- **Shopping Cart**: Intuitive cart management with quantity adjusters and real-time totals
- **Receipt Generation**: Digital receipts with printing support and full transaction history

### Product Management
- **Product Catalog**: Add, edit, and delete products with SKU, barcode, pricing, and stock tracking
- **Inventory Management**: Real-time stock level tracking with reorder alerts
- **Category Organization**: Organize products by category for easy browsing
- **Cost & Profit Tracking**: Track cost vs. selling price for margin analysis

### Customer Management
- **Customer Profiles**: Store customer information including phone, address, and email
- **Credit Tracking**: Manage customer credit accounts with balance updates
- **Loyalty Points**: Track loyalty points for customer retention programs
- **Purchase History**: View each customer's transaction history

### Payment Processing
- **Multiple Payment Methods**: 
  - Cash (with change calculation)
  - GCash (digital payment logging)
  - PayMaya (digital payment logging)
  - Customer Credit
- **Payment Tracking**: Automatically categorize and track payments by method

### Sales Reporting & Analytics
- **Daily Reports**: Today's revenue, transaction count, and payment breakdown
- **Weekly & Monthly Trends**: Compare sales performance over time
- **Top Selling Products**: Identify best-selling items
- **Payment Method Distribution**: See payment method popularity
- **Transaction History**: Full audit trail of all sales

### Promotions & Discounts
- **Multiple Discount Types**: Percentage-based, fixed amount, BOGO, bulk discounts
- **Promotion Scheduling**: Set start and end dates for time-limited promotions
- **Cart-Level Discounts**: Apply additional discounts per transaction
- **Promotion Effectiveness Tracking**: Monitor which promotions drive sales

### Store Configuration
- **Store Settings**: Customize store name, location, phone, and tax rate
- **Flexible Tax Rate**: Adjust tax calculations based on local regulations
- **Offline First**: All data stored locally with no internet required

## Technical Architecture

### Data Storage
- **IndexedDB**: Primary database for products, customers, transactions, and promotions
- **localStorage**: Settings and user preferences
- **Service Workers Ready**: Foundation for offline capability

### Technology Stack
- **Frontend**: Next.js 15, React 19.2, TypeScript
- **UI Framework**: shadcn/ui components with Tailwind CSS
- **Barcode Scanning**: @zxing/library
- **Charts**: Recharts for analytics visualization
- **State Management**: React hooks with custom hooks (useProducts, useCart, etc.)

### File Structure
```
/app
├── /dashboard          # Main dashboard with quick stats
├── /pos
│   └── /checkout      # POS checkout system
├── /products          # Product management
├── /customers         # Customer management
├── /reports           # Sales analytics
├── /promotions        # Discount management
└── /settings          # Store configuration

/components/pos
├── BarcodeScanner.tsx  # Barcode scanning
├── ShoppingCart.tsx    # Cart management
├── PaymentProcessor.tsx # Payment handling
├── ProductForm.tsx     # Product CRUD
├── ProductList.tsx     # Product listing
├── CustomerForm.tsx    # Customer CRUD
└── CustomerList.tsx    # Customer listing

/lib
├── db.ts              # IndexedDB wrapper
├── calculations.ts    # Tax, discount, totals
├── formatting.ts      # Currency, dates, receipts
└── types/index.ts     # TypeScript interfaces
```

## Data Models

### Product
```typescript
{
  id: string (UUID)
  sku: string (unique)
  barcode: string (unique)
  name: string
  category: string
  price: number
  cost: number
  stock: number
  reorderLevel: number
  isActive: boolean
  createdAt: timestamp
}
```

### Customer
```typescript
{
  id: string (UUID)
  name: string
  phone: string
  address: string
  email?: string
  creditBalance: number
  loyaltyPoints: number
  preferredPayment: 'CASH' | 'GCASH' | 'PAYAMYA' | 'CREDIT'
  createdAt: timestamp
  lastPurchase?: timestamp
}
```

### Transaction
```typescript
{
  id: string (UUID)
  transactionDate: timestamp
  customerId?: string
  items: CartItem[]
  subtotal: number
  tax: number
  totalDiscount: number
  total: number
  paymentMethod: PaymentMethod
  amountTendered: number
  change: number
  receiptNumber: string
  createdAt: timestamp
}
```

## Usage Workflow

### Morning Setup
1. Open the POS system on tablet or desktop
2. Check dashboard for overnight alerts and low stock items
3. Review settings if needed

### Processing a Sale
1. Click "New Sale" on dashboard or navigate to /pos/checkout
2. Scan product barcode or search/select from inventory
3. (Optional) Select customer for loyalty tracking
4. Apply any promotions or discounts
5. Review cart totals
6. Select payment method and process
7. Print or view receipt

### Managing Inventory
1. Go to Products page
2. View current stock levels
3. Edit products when prices or quantities change
4. Add new products as inventory arrives
5. Remove discontinued items

### Viewing Reports
1. Navigate to Reports page
2. View today's, week's, and month's revenue
3. Analyze top-selling products
4. Check payment method distribution
5. Export data for personal analysis

## Getting Started

### Installation
```bash
# Clone the project
cd sari-sari-pos

# Install dependencies
pnpm install

# Run development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the system.

### First Use
1. Go to Settings to configure your store
2. Add products to your catalog
3. Register regular customers
4. Create promotions if desired
5. Start processing sales

## Key Features Explained

### Barcode Scanning
- The system uses your device's camera to scan barcodes/QR codes
- Falls back to manual entry if camera is unavailable
- Requires camera permissions on first use
- Automatically looks up product details from catalog

### Shopping Cart
- Products can be added by scanning or searching
- Quantity can be adjusted with +/- buttons
- Discount can be applied per item
- Real-time calculation of subtotal, tax, and total
- Cart items can be removed individually

### Payment Processing
- Cash: Calculates and displays change automatically
- Digital (GCash/PayMaya): Records payment method for tracking
- Credit: Adds to customer's running credit balance
- All transactions timestamped and receipted

### Receipt Generation
- HTML-based receipts that match thermal printer format
- Includes store name, date/time, items, totals, and payment info
- Can be printed directly or viewed digitally
- Full receipt number for tracking

### Reporting
- Dashboard provides quick snapshot of today's performance
- Reports page shows detailed analytics with charts
- Payment breakdown shows cash vs. digital split
- Top products help optimize inventory

## Performance Considerations

- **Offline First**: All operations work without internet
- **Fast Transactions**: Local database ensures <1 second operations
- **Mobile Optimized**: Touch-friendly UI for tablets and phones
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Large Inventory**: Can handle 1000+ products efficiently

## Browser Requirements

- Modern browser with IndexedDB support (Chrome, Edge, Firefox, Safari)
- Barcode scanning requires camera access
- Works on desktop, tablet, and mobile devices
- Recommended: Landscape mode on tablets for better UX

## Tips for Store Operators

1. **Backup Your Data**: Regularly back up important data
2. **Regular Audits**: Match physical inventory with system records
3. **Price Updates**: Keep prices current when adjusting costs
4. **Customer Database**: Maintain accurate customer information
5. **Receipts**: Always provide customers with receipts
6. **Promotions**: Test promotions with limited time periods first

## Future Enhancements (Phase 2+)

- Cloud backup and sync
- Multi-user support
- Supplier integration
- Email receipts
- SMS notifications
- Advanced analytics dashboards
- Inventory forecasting
- Integration with e-commerce platforms

## Support & Troubleshooting

### Barcode Scanner Not Working
- Check camera permissions in browser settings
- Ensure adequate lighting for scanning
- Try manual entry as fallback
- Verify barcode format matches product

### Data Not Saving
- Check browser's IndexedDB quota
- Clear browser cache and try again
- Ensure device has sufficient storage

### Performance Issues
- Reduce number of items in cart
- Close other browser tabs
- Clear old transaction data if needed

---

**Sa inyong tiwala, kami ay magpatuloy**

Version 1.0 | Built for Filipino Entrepreneurs
