'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import QRCode from 'qrcode';
import JsBarcode from 'jsbarcode';

export default function CodeGenerator() {
  const [activeTab, setActiveTab] = useState('qr');
  const [qrValue, setQrValue] = useState('https://example.com');
  const [barcodeValue, setBarcodeValue] = useState('1234567890');
  const [generatedCode, setGeneratedCode] = useState('');
  const [error, setError] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => {
      if (activeTab === 'qr') {
        generateQRCode();
      } else {
        generateBarcode();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [activeTab, qrValue, barcodeValue]);

  useEffect(() => {
    if (activeTab === 'qr') {
      generateQRCode();
    } else {
      generateBarcode();
    }
  }, [qrValue, barcodeValue, activeTab]);

  const generateQRCode = async () => {
    try {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (canvas && container) {
        const containerWidth = container.offsetWidth;
        const size = Math.min(containerWidth, 300); // Limit max size to 300px
        await QRCode.toCanvas(canvas, qrValue || ' ', {
          width: size,
          // Remove the height property
          // height: size,
        });
        canvas.style.width = `${size}px`;
        canvas.style.height = `${size}px`; // Set height via style instead
        setGeneratedCode(canvas.toDataURL('image/png'));
      }
      setError('');
    } catch (err) {
      console.error(err);
      setError('Failed to generate QR code');
    }
  };

  const generateBarcode = () => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (canvas && container && barcodeValue.length < 3) {
      setError('Barcode value must be at least 3 characters long');
      return;
    }
    try {
      if (canvas && container) {
        const containerWidth = container.offsetWidth;
        const width = Math.min(containerWidth, 300); // Limit max width to 300px
        JsBarcode(canvas, barcodeValue, {
          format: 'CODE128',
          width: 2,
          height: 100,
          displayValue: true,
        });
        canvas.style.width = `${width}px`;
        canvas.style.height = 'auto';
        setGeneratedCode(canvas.toDataURL('image/png'));
      }
      setError('');
    } catch (err) {
      console.error(err);
      setError('Failed to generate barcode');
    }
  };

  const downloadCode = () => {
    const link = document.createElement('a');
    link.download = `${activeTab === 'qr' ? 'qrcode' : 'barcode'}.png`;
    link.href = generatedCode;
    link.click();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 bg-dotted-pattern">
      <Card className="w-full max-w-md p-6 bg-white shadow-lg">
        <h1 className="text-2xl font-bold mb-4 text-center">Code Generator</h1>
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-4"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="qr">QR Code</TabsTrigger>
            <TabsTrigger value="barcode">Barcode</TabsTrigger>
          </TabsList>
          <TabsContent value="qr" className="space-y-4">
            <div>
              <Label htmlFor="qr-value">Enter URL or text</Label>
              <Input
                type="text"
                id="qr-value"
                value={qrValue}
                onChange={(e) => setQrValue(e.target.value)}
                placeholder="https://example.com"
              />
            </div>
          </TabsContent>
          <TabsContent value="barcode" className="space-y-4">
            <div>
              <Label htmlFor="barcode-value">
                Enter barcode value (min 3 characters)
              </Label>
              <Input
                type="text"
                id="barcode-value"
                value={barcodeValue}
                onChange={(e) => setBarcodeValue(e.target.value)}
                placeholder="1234567890"
              />
            </div>
          </TabsContent>
        </Tabs>
        <div ref={containerRef} className="mt-4 flex justify-center">
          <canvas
            ref={canvasRef}
            className="border border-gray-300 rounded-lg"
          />
        </div>
        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <Button
          onClick={downloadCode}
          className="w-full mt-4"
          disabled={!!error}
        >
          Download {activeTab === 'qr' ? 'QR Code' : 'Barcode'}
        </Button>
      </Card>
    </div>
  );
}

const styles = `
  @tailwind base;
  @tailwind components;
  @tailwind utilities;

  .bg-dotted-pattern {
    background-image: radial-gradient(circle, #000000 1px, transparent 1px);
    background-size: 20px 20px;
  }
`;
