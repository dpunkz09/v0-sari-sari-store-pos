export function generateSKU(productName: string, existingSKUs: string[]): string {
  // Remove special characters and convert to lowercase
  const baseSKU = productName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .trim();

  if (!baseSKU) return 'SKU001';

  // Check if base SKU exists
  if (!existingSKUs.includes(baseSKU)) {
    return baseSKU;
  }

  // If exists, add numbered suffix
  let counter = 1;
  while (existingSKUs.includes(`${baseSKU}${counter}`)) {
    counter++;
  }

  return `${baseSKU}${counter}`;
}

// Unicode-safe base64 encoding for HTML with special characters
export function encodeToBase64(str: string): string {
  try {
    return btoa(unescape(encodeURIComponent(str)));
  } catch (error) {
    // Fallback for edge cases
    const blob = new Blob([str], { type: 'text/plain' });
    return URL.createObjectURL(blob);
  }
}

export function formatCurrency(amount: number, currency: string = 'PHP'): string {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatDateTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-PH', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export function generateReceiptNumber(): string {
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `RCP-${timestamp}-${random}`;
}

export function getTodayStart(): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today.getTime();
}

export function getTodayEnd(): number {
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  return today.getTime();
}

export function getWeekStart(): number {
  const today = new Date();
  const day = today.getDay();
  const diff = today.getDate() - day + (day === 0 ? -6 : 1);
  const date = new Date(today.setDate(diff));
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

export function getMonthStart(): number {
  const today = new Date();
  const date = new Date(today.getFullYear(), today.getMonth(), 1);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

export function generateReceiptHTML(transaction: any, storeName: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Receipt</title>
      <style>
        body { font-family: monospace; margin: 0; padding: 10px; }
        .receipt { width: 80mm; margin: 0 auto; }
        .header { text-align: center; margin-bottom: 10px; }
        .store-name { font-weight: bold; font-size: 16px; }
        .date { font-size: 12px; color: #666; }
        .divider { border-top: 1px dashed #000; margin: 10px 0; }
        .items { margin: 10px 0; }
        .item { display: flex; justify-content: space-between; font-size: 12px; }
        .total-section { margin-top: 10px; }
        .total-row { display: flex; justify-content: space-between; font-weight: bold; }
        .payment { font-size: 12px; margin-top: 10px; }
        .footer { text-align: center; font-size: 10px; margin-top: 20px; color: #666; }
      </style>
    </head>
    <body>
      <div class="receipt">
        <div class="header">
          <div class="store-name">${storeName}</div>
          <div class="date">${formatDateTime(transaction.createdAt)}</div>
          <div style="font-size: 11px;">Receipt: ${transaction.receiptNumber}</div>
        </div>
        <div class="divider"></div>
        <div class="items">
          ${transaction.items.map((item: any) => `
            <div class="item">
              <span>${item.name} x${item.quantity}</span>
              <span>${formatCurrency(item.price * item.quantity)}</span>
            </div>
          `).join('')}
        </div>
        <div class="divider"></div>
        <div class="total-section">
          <div class="item">
            <span>Subtotal:</span>
            <span>${formatCurrency(transaction.subtotal)}</span>
          </div>
          ${transaction.tax > 0 ? `
            <div class="item">
              <span>Tax:</span>
              <span>${formatCurrency(transaction.tax)}</span>
            </div>
          ` : ''}
          ${transaction.totalDiscount > 0 ? `
            <div class="item">
              <span>Discount:</span>
              <span>-${formatCurrency(transaction.totalDiscount)}</span>
            </div>
          ` : ''}
          <div class="divider"></div>
          <div class="total-row">
            <span>TOTAL:</span>
            <span>${formatCurrency(transaction.total)}</span>
          </div>
        </div>
        <div class="payment">
          <div><strong>Payment Method:</strong> ${transaction.paymentMethod}</div>
          <div><strong>Amount Tendered:</strong> ${formatCurrency(transaction.amountTendered)}</div>
          <div><strong>Change:</strong> ${formatCurrency(transaction.change)}</div>
        </div>
        <div class="footer">
          <p>Thank you for your purchase!</p>
          <p>Sa inyong tiwala, kami ay magpatuloy</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
