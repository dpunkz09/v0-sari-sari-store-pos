'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { Printer, Download, X } from 'lucide-react';
import { encodeToBase64 } from '@/lib/formatting';

interface ReceiptModalProps {
  receiptHTML: string | null;
  isOpen: boolean;
  onClose: () => void;
  onPrint?: () => void;
}

export function ReceiptModal({
  receiptHTML,
  isOpen,
  onClose,
  onPrint,
}: ReceiptModalProps) {
  const [isPrinting, setIsPrinting] = useState(false);

  const handlePrint = () => {
    if (!receiptHTML) return;
    setIsPrinting(true);
    const printWindow = window.open('', '', 'height=600,width=800');
    if (printWindow) {
      printWindow.document.write(receiptHTML);
      printWindow.document.close();
      printWindow.onafterprint = () => {
        setIsPrinting(false);
        printWindow.close();
      };
      setTimeout(() => {
        printWindow.print();
      }, 250);
    }
  };

  const handleDownload = () => {
    if (!receiptHTML) return;
    const element = document.createElement('a');
    element.href = 'data:text/html;charset=utf-8,' + encodeURIComponent(receiptHTML);
    element.download = `receipt-${Date.now()}.html`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleViewInNewTab = () => {
    if (!receiptHTML) return;
    try {
      const encoded = encodeToBase64(receiptHTML);
      window.open('data:text/html;base64,' + encoded, '_blank');
    } catch (error) {
      console.error('[v0] Error opening receipt:', error);
      alert('Could not open receipt in new tab');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Receipt</DialogTitle>
        </DialogHeader>

        {receiptHTML && (
          <div className="flex-1 overflow-y-auto border border-border rounded-lg bg-white p-4">
            <div
              className="text-sm font-mono"
              dangerouslySetInnerHTML={{ __html: receiptHTML }}
            />
          </div>
        )}

        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleDownload}
            className="flex-1 gap-2"
          >
            <Download className="h-4 w-4" />
            Download
          </Button>
          <Button
            variant="outline"
            onClick={handleViewInNewTab}
            className="flex-1"
          >
            View Full
          </Button>
          <Button
            onClick={handlePrint}
            disabled={isPrinting}
            className="flex-1 gap-2"
          >
            <Printer className="h-4 w-4" />
            {isPrinting ? 'Printing...' : 'Print'}
          </Button>
          <Button
            onClick={onClose}
            variant="default"
            className="flex-1 gap-2"
          >
            <X className="h-4 w-4" />
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
