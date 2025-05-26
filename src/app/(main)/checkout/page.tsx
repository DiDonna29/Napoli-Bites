
// src/app/(main)/checkout/page.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useSearchParams, useRouter } from 'next/navigation';
import Link from "next/link";
import { CreditCard, CheckCircle, Loader2, ShoppingCart } from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/firebase/config";
import { collection, addDoc } from "firebase/firestore"; // serverTimestamp removed as we use Date.now()
import type { Order, OrderItem } from "@/types";
import { useCart } from "@/hooks/useCart"; // Import useCart

const TAX_RATE = 0.10; // 10% tax

function CheckoutPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const { cartItems, getCartSubtotal, clearCart: clearCartHook } = useCart(); // Use cart hook

  const [isClient, setIsClient] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Order details from URL params (primarily for non-cart related info like type/address)
  const orderType = searchParams.get('orderType') || 'delivery'; // Default to delivery if not specified
  const address = searchParams.get('address');
  const tableId = searchParams.get('tableId');

  // Calculate totals based on cartItems from useCart
  const subtotal = getCartSubtotal();
  const taxAmount = subtotal * TAX_RATE;
  const finalTotal = subtotal + taxAmount;
  
  useEffect(() => {
    setIsClient(true);
    if (!authLoading && !user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to proceed to checkout.",
        variant: "destructive",
      });
      // Preserve current checkout query params when redirecting to login
      const redirectParams = new URLSearchParams(searchParams.toString());
      router.push(`/login?redirect=/checkout%3F${redirectParams.toString()}`);
    }

    if (!authLoading && user && cartItems.length === 0) {
      toast({
        title: "Cart Empty",
        description: "Your cart is empty. Please add items before checking out.",
        variant: "destructive",
      });
      router.push('/order'); // Or '/' to browse menu
    }
  }, [user, authLoading, router, toast, searchParams, cartItems]);

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
        items: cartItems, // Use detailed cartItems from useCart
        totalAmount: finalTotal,
        orderType: orderType,
        ...(orderType === 'delivery' && address && { deliveryAddress: decodeURIComponent(address) }),
        ...(orderType === 'dine-in' && tableId && { tableId: tableId }),
      };

      const docRef = await addDoc(collection(db, "orders"), newOrder);
      const orderId = docRef.id;

      clearCartHook(); // Clear cart using hook after successful order

      toast({ title: "Order Placed!", description: "Your payment was successful and your order is confirmed." });
      router.push(`/confirmation/${orderId}?total=${finalTotal.toFixed(2)}&orderType=${orderType}`);

    } catch (error) {
      console.error("Error placing order: ", error);
      toast({ title: "Order Placement Failed", description: "Could not save your order. Please try again.", variant: "destructive" });
      setIsProcessing(false);
    }
  };
  
  if (authLoading || !isClient) {
    return (
      <div className="container mx-auto py-12 px-4 text-center flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p>Loading checkout...</p>
      </div>
    );
  }

  if (!user && !authLoading) {
     return (
      <div className="container mx-auto py-12 px-4 text-center flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p>Redirecting to login...</p>
      </div>
    );
  }
  
  if (cartItems.length === 0 && !authLoading && user) {
    return (
      <div className="container mx-auto py-12 px-4 text-center">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <CardTitle>Your Cart is Empty</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>Please add items to your cart before proceeding to checkout.</CardDescription>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
              <Link href="/order">Go to Order Page</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
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
                    <div key={item.cartItemId} className="flex justify-between items-start py-2 text-sm border-b last:border-b-0">
                        <div>
                            <p>{item.name} (x{item.quantity})</p>
                            {item.type === 'pizza' && item.selectedAddons && item.selectedAddons.length > 0 && (
                                <p className="text-xs text-muted-foreground pl-2">
                                    Add-ons: {item.selectedAddons.map(a => a.name).join(', ')}
                                </p>
                            )}
                        </div>
                        <span>${item.totalPrice.toFixed(2)}</span>
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
              <div className="flex justify-between"><span>Subtotal:</span><span>${subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>Tax ({ (TAX_RATE * 100).toFixed(0) }%):</span><span>${taxAmount.toFixed(2)}</span></div>
              <Separator className="my-1"/>
              <div className="flex justify-between font-bold text-lg"><span>Total Amount:</span><span className="text-primary">${finalTotal.toFixed(2)}</span></div>
            </div>
          </div>
           <Separator />
           <div className="text-center">
            <p className="text-sm text-muted-foreground mb-4">You will be redirected for a simulated payment.</p>
            <Button 
                size="lg" 
                className="w-full bg-green-600 hover:bg-green-700 text-white" 
                onClick={handleSimulatePayment}
                disabled={isProcessing || cartItems.length === 0 || !user}
            >
              {isProcessing ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <CreditCard className="mr-2 h-5 w-5"/>}
              {isProcessing ? "Processing..." : "Simulate Payment"}
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
    <Suspense fallback={
      <div className="container mx-auto py-12 px-4 text-center flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    }>
      <CheckoutPageContent/>
    </Suspense>
  );
}
