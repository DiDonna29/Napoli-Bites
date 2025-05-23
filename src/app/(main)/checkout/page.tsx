// src/app/(main)/checkout/page.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useSearchParams } from 'next/navigation';
import Link from "next/link";
import { CreditCard, CheckCircle } from "lucide-react";
import { Suspense, useEffect, useState } from "react";

function CheckoutPageContent() {
  const searchParams = useSearchParams();
  const orderType = searchParams.get('orderType') || 'N/A';
  const total = searchParams.get('total') || '0.00';
  const address = searchParams.get('address');
  const tableId = searchParams.get('tableId');

  // Simulate tax calculation
  const subtotal = parseFloat(total);
  const taxRate = 0.10; // 10% tax
  const taxAmount = subtotal * taxRate;
  const finalTotal = subtotal + taxAmount;
  
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);


  // Generate a mock UUID for the order
  const mockOrderId = isClient ? crypto.randomUUID() : 'loading-uuid';

  return (
    <div className="container mx-auto py-12 px-4 max-w-2xl">
      <Card className="shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-lora text-primary">Checkout</CardTitle>
          <CardDescription>Review your order and complete payment.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Order Details</h3>
            <div className="space-y-1 text-sm">
              <p><strong>Order Type:</strong> {orderType.charAt(0).toUpperCase() + orderType.slice(1)}</p>
              {orderType === 'delivery' && address && <p><strong>Delivery Address:</strong> {decodeURIComponent(address)}</p>}
              {orderType === 'dine-in' && tableId && <p><strong>Table Reserved:</strong> #{tableId}</p>}
            </div>
          </div>
          <Separator />
          <div>
            <h3 className="text-lg font-semibold mb-2">Payment Summary</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between"><span>Subtotal:</span><span>${subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>Tax (10%):</span><span>${taxAmount.toFixed(2)}</span></div>
              <Separator className="my-1"/>
              <div className="flex justify-between font-bold text-lg"><span>Total Amount:</span><span className="text-primary">${finalTotal.toFixed(2)}</span></div>
            </div>
          </div>
           <Separator />
           <div className="text-center">
            <p className="text-sm text-muted-foreground mb-4">You will be redirected to Stripe for a simulated payment.</p>
            <Button size="lg" className="w-full bg-green-600 hover:bg-green-700 text-white" asChild>
              <Link href={`/confirmation/${mockOrderId}?total=${finalTotal.toFixed(2)}&orderType=${orderType}`}>
                <CreditCard className="mr-2 h-5 w-5"/> Simulate Payment with Stripe
              </Link>
            </Button>
           </div>
        </CardContent>
        <CardFooter>
            <p className="text-xs text-muted-foreground text-center w-full">
                This is a simulated payment process. No real transaction will occur.
            </p>
        </CardFooter>
      </Card>
    </div>
  );
}


export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="container mx-auto py-12 text-center">Loading checkout...</div>}>
      <CheckoutPageContent/>
    </Suspense>
  );
}
