'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field';
import { db } from '@/lib/db';

export default function SettingsPage() {
  const [storeSettings, setStoreSettings] = useState({
    storeName: 'Sari-Sari Store',
    location: '',
    phone: '',
    taxRate: 12,
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      try {
        await db.init();
        const name = (await db.getSetting('storeName')) || storeSettings.storeName;
        const location = (await db.getSetting('location')) || '';
        const phone = (await db.getSetting('phone')) || '';
        const taxRate = (await db.getSetting('taxRate')) || 12;
        
        setStoreSettings({
          storeName: name as string,
          location: location as string,
          phone: phone as string,
          taxRate: taxRate as number,
        });
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    }
    loadSettings();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await db.init();
      await db.saveSetting('storeName', storeSettings.storeName);
      await db.saveSetting('location', storeSettings.location);
      await db.saveSetting('phone', storeSettings.phone);
      await db.saveSetting('taxRate', storeSettings.taxRate);
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Error saving settings');
    } finally {
      setIsSaving(false);
    }
  };

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
              <h1 className="text-2xl font-bold text-foreground">Settings</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Configure your store
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <Card>
          <CardHeader>
            <CardTitle>Store Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <FieldGroup>
              <Field>
                <FieldLabel>Store Name</FieldLabel>
                <Input
                  value={storeSettings.storeName}
                  onChange={(e) =>
                    setStoreSettings({
                      ...storeSettings,
                      storeName: e.target.value,
                    })
                  }
                  placeholder="Your Store Name"
                />
              </Field>
            </FieldGroup>

            <FieldGroup>
              <Field>
                <FieldLabel>Location</FieldLabel>
                <Input
                  value={storeSettings.location}
                  onChange={(e) =>
                    setStoreSettings({
                      ...storeSettings,
                      location: e.target.value,
                    })
                  }
                  placeholder="e.g., Barangay, Municipality"
                />
              </Field>
            </FieldGroup>

            <FieldGroup>
              <Field>
                <FieldLabel>Phone Number</FieldLabel>
                <Input
                  value={storeSettings.phone}
                  onChange={(e) =>
                    setStoreSettings({ ...storeSettings, phone: e.target.value })
                  }
                  placeholder="e.g., 09123456789"
                />
              </Field>
            </FieldGroup>

            <FieldGroup>
              <Field>
                <FieldLabel>Tax Rate (%)</FieldLabel>
                <Input
                  type="number"
                  step="0.1"
                  value={storeSettings.taxRate}
                  onChange={(e) =>
                    setStoreSettings({
                      ...storeSettings,
                      taxRate: parseFloat(e.target.value) || 0,
                    })
                  }
                  placeholder="12"
                />
              </Field>
            </FieldGroup>

            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full gap-2"
            >
              <Save className="h-4 w-4" />
              {isSaving ? 'Saving...' : 'Save Settings'}
            </Button>
          </CardContent>
        </Card>

        {/* About */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-base">About Sari-Sari POS</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              Sari-Sari POS is a modern, easy-to-use point of sale system designed specifically for sari-sari stores.
            </p>
            <p>
              <strong>Features:</strong>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Barcode scanning and manual entry</li>
                <li>Customer management and loyalty</li>
                <li>Multiple payment methods</li>
                <li>Sales reporting and analytics</li>
                <li>Promotional discounts</li>
                <li>Inventory management</li>
              </ul>
            </p>
            <p>
              All data is stored locally on your device for fast, offline-first operation.
            </p>
            <p className="text-xs pt-2">
              Version 1.0 | Sa inyong tiwala, kami ay magpatuloy
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
