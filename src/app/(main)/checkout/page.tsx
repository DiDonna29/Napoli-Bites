// src/app/(main)/checkout/page.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useSearchParams, useRouter } from 'next/navigation';
import Link from "next/link";
import { CreditCard, CheckCircle, Loader2 } from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/firebase/config";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import type { Order, OrderItem } from "@/types";

function CheckoutPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [isClient, setIsClient] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cartItems, setCartItems] = useState<OrderItem[]>([]);
  
  const orderType = searchParams.get('orderType') || 'N/A';
  const subtotalParam = parseFloat(searchParams.get('total') || '0.00'); // This is subtotal from order page
  const address = searchParams.get('address');
  const tableId = searchParams.get('tableId');

  const taxRate = 0.10; // 10% tax
  const taxAmount = subtotalParam * taxRate;
  const finalTotal = subtotalParam + taxAmount;
  
  useEffect(() => {
    setIsClient(true);
    if (!authLoading && !user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to proceed to checkout.",
        variant: "destructive",
      });
      router.push(`/login?redirect=/checkout${searchParams.toString() ? '?' + searchParams.toString() : ''}`);
    }

    // Retrieve cart items from localStorage
    const storedCart = localStorage.getItem('napoliBitesCart');
    if (storedCart) {
      setCartItems(JSON.parse(storedCart));
    } else if (user) { // only show warning if user is logged in and cart is missing
      toast({
        title: "Cart Empty",
        description: "Your cart is empty. Please add items before checking out.",
        variant: "destructive",
      });
      router.push('/order');
    }
  }, [user, authLoading, router, toast, searchParams]);

  const handleSimulatePayment = async () => {
    if (!user) {
      toast({ title: "Error", description: "User not authenticated.", variant: "destructive" });
      return;
    }
    if (cartItems.length === 0) {
      toast({ title: "Error", description: "Your cart is empty.", variant: "destructive" });
      return;
    }

    setIsProcessing(true);
    try {
      const newOrder: Order = {
        userId: user.uid,
        createdAt: Date.now(),
        status: 'confirmed', // Simulate successful payment
        items: cartItems,
        totalAmount: finalTotal,
        orderType: orderType,
        ...(orderType === 'delivery' && address && { deliveryAddress: decodeURIComponent(address) }),
        ...(orderType === 'dine-in' && tableId && { tableId: tableId }),
      };

      const docRef = await addDoc(collection(db, "orders"), newOrder);
      const orderId = docRef.id;

      localStorage.removeItem('napoliBitesCart'); // Clear cart after successful order

      toast({ title: "Order Placed!", description: "Your payment was successful and your order is confirmed." });
      router.push(`/confirmation/${orderId}?total=${finalTotal.toFixed(2)}&orderType=${orderType}`);

    } catch (error) {
      console.error("Error placing order: ", error);
      toast({ title: "Order Placement Failed", description: "Could not save your order. Please try again.", variant: "destructive" });
      setIsProcessing(false);
    }
  };
  
  if (authLoading || !isClient) {
    return <div className="container mx-auto py-12 px-4 text-center">Loading checkout...</div>;
  }

  if (!user && !authLoading) {
    return <div className="container mx-auto py-12 px-4 text-center">Redirecting to login...</div>;
  }

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
             <h3 className="text-lg font-semibold mb-2">Items</h3>
            {cartItems.length > 0 ? (
                cartItems.map(item => (
                    <div key={`${item.id}-${item.type}`} className="flex justify-between items-center py-1 text-sm">
                        <span>{item.name} (x{item.quantity})</span>
                        <span>${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                ))
            ) : (
                <p className="text-sm text-muted-foreground">Your cart is empty.</p>
            )}
          </div>
          <Separator />
          <div>
            <h3 className="text-lg font-semibold mb-2">Payment Summary</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between"><span>Subtotal:</span><span>${subtotalParam.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>Tax (10%):</span><span>${taxAmount.toFixed(2)}</span></div>
              <Separator className="my-1"/>
              <div className="flex justify-between font-bold text-lg"><span>Total Amount:</span><span className="text-primary">${finalTotal.toFixed(2)}</span></div>
            </div>
          </div>
           <Separator />
           <div className="text-center">
            <p className="text-sm text-muted-foreground mb-4">You will be redirected to Stripe for a simulated payment.</p>
            <Button 
                size="lg" 
                className="w-full bg-green-600 hover:bg-green-700 text-white" 
                onClick={handleSimulatePayment}
                disabled={isProcessing || cartItems.length === 0}
            >
              {isProcessing ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <CreditCard className="mr-2 h-5 w-5"/>}
              {isProcessing ? "Processing..." : "Simulate Payment with Stripe"}
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
