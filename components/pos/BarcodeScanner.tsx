'use client';

import { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader, NotFoundException } from '@zxing/library';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  isActive: boolean;
}

export function BarcodeScanner({ onScan, isActive }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isScannerReady, setIsScannerReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manualBarcode, setManualBarcode] = useState('');
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);

  useEffect(() => {
    if (!isActive || !videoRef.current) return;

    const initScanner = async () => {
      try {
        setError(null);
        readerRef.current = new BrowserMultiFormatReader();
        const videoInputDevices = await BrowserMultiFormatReader.listVideoInputDevices();

        if (videoInputDevices.length === 0) {
          setError('No camera found on this device');
          return;
        }

        // Use rear camera if available
        const selectedDevice =
          videoInputDevices.find((device) =>
            device.label.toLowerCase().includes('back')
          ) || videoInputDevices[videoInputDevices.length - 1];

        await readerRef.current.decodeFromVideoDevice(
          selectedDevice?.deviceId,
          videoRef.current,
          (result, error) => {
            if (result) {
              const barcode = result.getText();
              onScan(barcode);
              setManualBarcode('');
            }
            if (error && !(error instanceof NotFoundException)) {
              console.error('Scan error:', error);
            }
          }
        );

        setIsScannerReady(true);
      } catch (err) {
        console.error('Scanner init error:', err);
        setError(
          'Unable to access camera. Make sure you granted permission and try again.'
        );
        setIsScannerReady(false);
      }
    };

    initScanner();

    return () => {
      if (readerRef.current) {
        readerRef.current.reset();
      }
    };
  }, [isActive, onScan]);

  const handleManualEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualBarcode.trim()) {
      onScan(manualBarcode.trim());
      setManualBarcode('');
    }
  };

  if (!isActive) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Scan Product Barcode</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="flex items-start gap-3 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <div>{error}</div>
          </div>
        )}

        {isScannerReady && (
          <video
            ref={videoRef}
            className="w-full rounded-lg border-2 border-border bg-black"
            style={{ maxHeight: '300px', objectFit: 'cover' }}
          />
        )}

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Or enter manually:
          </label>
          <form onSubmit={handleManualEntry} className="flex gap-2">
            <Input
              autoFocus
              value={manualBarcode}
              onChange={(e) => setManualBarcode(e.target.value)}
              placeholder="Enter barcode and press Enter"
              className="flex-1"
            />
            <Button type="submit" className="px-4">
              Add
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}
