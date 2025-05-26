
// src/app/(main)/confirmation/[orderId]/page.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, Download, ShoppingBag, Loader2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams, useParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/lib/firebase/config";
import { doc, getDoc } from "firebase/firestore";
import type { Order, OrderItem, UserProfile } from "@/types"; 

function ConfirmationPageContent() {
  const routeParams = useParams<{ orderId: string }>();
  const orderId = routeParams.orderId;

  const searchParams = useSearchParams();
  const totalAmountParam = searchParams.get('total');
  const orderTypeParam = searchParams.get('orderType');

  const { user: authUser, userData: authUserData, loading: authLoading } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [customer, setCustomer] = useState<UserProfile | null>(null);
  const [loadingOrder, setLoadingOrder] = useState(true);
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    setCurrentDate(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }));

    const fetchOrderDetails = async () => {
      if (!orderId) return;
      setLoadingOrder(true);
      try {
        const orderDocRef = doc(db, "orders", orderId);
        const orderDocSnap = await getDoc(orderDocRef);

        if (orderDocSnap.exists()) {
          const fetchedOrder = { ...orderDocSnap.data(), orderId: orderDocSnap.id } as Order;
          setOrder(fetchedOrder);

          if (fetchedOrder.userId && (!authUserData || authUserData.uid !== fetchedOrder.userId)) {
            const userDocRef = doc(db, "users", fetchedOrder.userId);
            const userDocSnap = await getDoc(userDocRef);
            if (userDocSnap.exists()) {
              setCustomer(userDocSnap.data() as UserProfile);
            }
          } else if (authUserData) {
            setCustomer(authUserData);
          }
        } else {
          console.error("Order not found with ID:", orderId);
          setOrder(null); // Explicitly set order to null if not found
        }
      } catch (error) {
        console.error("Error fetching order details:", error);
        setOrder(null); // Set order to null on error
      } finally {
        setLoadingOrder(false);
      }
    };

    fetchOrderDetails();
  }, [orderId, authUserData]);

  const displayTotalAmount = totalAmountParam ? parseFloat(totalAmountParam).toFixed(2) : (order?.totalAmount?.toFixed(2) || '0.00');
  const displayOrderType = orderTypeParam || order?.orderType || 'N/A';
  const displayCustomerName = customer?.displayName || authUser?.displayName || "Valued Customer";
  const displayCustomerEmail = customer?.email || authUser?.email || "N/A";


  if (authLoading || loadingOrder) {
    return (
      <div className="container mx-auto py-12 px-4 max-w-3xl text-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
        <p>Loading confirmation details...</p>
      </div>
    );
  }

  if (!order && !loadingOrder) {
     return (
      <div className="container mx-auto py-12 px-4 max-w-3xl text-center">
        <Card><CardContent className="p-8"><p className="text-xl text-destructive">Order not found. It might still be processing or the ID is incorrect.</p></CardContent></Card>
      </div>
    );
  }
  
  if (!order) { // Additional check after loading is complete
     return (
      <div className="container mx-auto py-12 px-4 max-w-3xl text-center">
        <Card><CardContent className="p-8"><p className="text-xl text-destructive">Could not load order details.</p></CardContent></Card>
      </div>
    );
  }


  return (
    <div className="container mx-auto py-12 px-4 max-w-3xl">
      <Card className="shadow-xl">
        <CardHeader className="text-center items-center">
          <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
          <CardTitle className="text-3xl font-lora text-primary">Order Confirmed!</CardTitle>
          <CardDescription className="text-lg">Thank you for your order, {displayCustomerName}. Your delicious meal is being prepared.</CardDescription>
          <p className="text-sm text-muted-foreground pt-2">Order ID: {order.orderId}</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="border rounded-lg p-6">
            <h2 className="text-xl font-lora font-semibold mb-4 flex items-center"><ShoppingBag className="mr-2 h-5 w-5 text-primary"/>Invoice Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <h3 className="font-semibold text-muted-foreground">Billed To:</h3>
                <p>{displayCustomerName}</p>
                <p>{displayCustomerEmail}</p>
              </div>
              <div className="md:text-right">
                <h3 className="font-semibold text-muted-foreground">Invoice Date:</h3>
                <p>{new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                <h3 className="font-semibold text-muted-foreground mt-1">Order Type:</h3>
                <p>{displayOrderType.charAt(0).toUpperCase() + displayOrderType.slice(1)}</p>
              </div>
            </div>

            <Separator className="my-4" />

            <h3 className="font-semibold text-muted-foreground mb-2">Order Summary:</h3>
            <div className="space-y-1 text-sm mb-4">
              {order.items.map((item: OrderItem) => (
                <div key={item.cartItemId || item.productId} className="flex justify-between">
                  <div>
                    <span>{item.name} (x{item.quantity})</span>
                    {item.type === 'pizza' && item.selectedAddons && item.selectedAddons.length > 0 && (
                        <p className="text-xs text-muted-foreground pl-2">
                            Add-ons: {item.selectedAddons.map(a => a.name).join(', ')}
                        </p>
                    )}
                  </div>
                  <span>${item.totalPrice.toFixed(2)}</span>
                </div>
              ))}
            </div>
            
            <Separator className="my-4" />
            
            <div className="flex justify-between items-center font-bold text-lg mt-2">
              <span>Total Amount Paid:</span>
              <span className="text-primary">${order.totalAmount.toFixed(2)}</span>
            </div>
            <p className="text-xs text-muted-foreground text-right mt-1">(inclusive of all taxes)</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="outline" className="w-full sm:w-auto" onClick={() => alert("PDF download feature coming soon!")}>
              <Download className="mr-2 h-4 w-4" /> Download Invoice (PDF)
            </Button>
            <Button className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground" asChild>
              <Link href="/profile/orders">
                <ShoppingBag className="mr-2 h-4 w-4" /> View Order History
              </Link>
            </Button>
          </div>
        </CardContent>
        <CardFooter className="text-center">
          <p className="text-sm text-muted-foreground w-full">
            Questions about your order? <Link href="/contact" className="text-primary underline">Contact us</Link>.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function ConfirmationPage() { // Removed props since ConfirmationPageContent uses hooks
 return (
    <Suspense fallback={<div className="container mx-auto py-12 px-4 max-w-3xl text-center"><Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" /></div>}>
      <ConfirmationPageContent />
    </Suspense>
  );
}

    