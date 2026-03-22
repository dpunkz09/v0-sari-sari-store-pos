'use client';

import { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader, NotFoundException } from '@zxing/library';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Camera, X } from 'lucide-react';

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  isActive: boolean;
}

export function BarcodeScanner({ onScan, isActive }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isScannerReady, setIsScannerReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manualBarcode, setManualBarcode] = useState('');
  const [showScanner, setShowScanner] = useState(true);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);

  useEffect(() => {
    if (!isActive || !videoRef.current || !showScanner) return;

    const initScanner = async () => {
      try {
        setError(null);
        readerRef.current = new BrowserMultiFormatReader();
        const videoInputDevices = await BrowserMultiFormatReader.listVideoInputDevices();

        if (videoInputDevices.length === 0) {
          setError('No camera found on this device');
          return;
        }

        // Prefer rear camera on mobile
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
              console.error('[v0] Scan error:', error);
            }
          }
        );

        setIsScannerReady(true);
      } catch (err) {
        console.error('[v0] Scanner init error:', err);
        setError(
          'Unable to access camera. Ensure camera permissions are granted.'
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
  }, [isActive, onScan, showScanner]);

  const handleManualEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualBarcode.trim()) {
      onScan(manualBarcode.trim());
      setManualBarcode('');
    }
  };

  if (!isActive || !showScanner) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-base flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Camera className="h-4 w-4" />
              Scan Product
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowScanner(true)}
              className="h-8 w-8 p-0"
            >
              <Camera className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">
            Click the camera icon to start scanning
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Camera className="h-4 w-4" />
            Scan Barcode
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowScanner(false)}
            className="h-8 w-8 p-0 text-muted-foreground"
            title="Hide scanner"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {error && (
          <div className="flex items-start gap-3 rounded-lg bg-destructive/10 p-3 text-xs text-destructive">
            <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <div>{error}</div>
          </div>
        )}

        {isScannerReady && (
          <div className="relative w-full bg-black rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              className="w-full h-auto"
              style={{ maxHeight: '300px', objectFit: 'cover' }}
              playsInline
              autoPlay
              muted
            />
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-0 border-2 border-primary/30" />
              <div className="absolute top-1/4 left-1/4 right-1/4 bottom-1/4 border-2 border-primary" />
            </div>
          </div>
        )}

        <div className="space-y-2 pt-2">
          <label className="text-xs font-medium text-foreground block">
            Or enter manually:
          </label>
          <form onSubmit={handleManualEntry} className="flex gap-2">
            <Input
              autoFocus
              value={manualBarcode}
              onChange={(e) => setManualBarcode(e.target.value)}
              placeholder="Enter barcode..."
              className="text-sm h-10"
              inputMode="numeric"
            />
            <Button type="submit" className="px-3 h-10 text-sm">
              Add
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}
