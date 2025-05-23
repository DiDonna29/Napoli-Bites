// src/app/(main)/confirmation/[orderId]/page.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, Download, ShoppingBag, User } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

interface ConfirmationPageProps {
  params: { orderId: string };
}

function ConfirmationPageContent({ params }: ConfirmationPageProps) {
  const { orderId } = params;
  const searchParams = useSearchParams();
  const totalAmount = searchParams.get('total') || '0.00';
  const orderType = searchParams.get('orderType') || 'N/A';
  
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    setCurrentDate(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }));
  }, []);


  // Mock user and order data
  const mockUser = {
    name: "John Doe",
    email: "john.doe@example.com",
  };
  const mockOrderItems = [
    { name: "Pizza Margherita (Medium)", quantity: 1, price: 15.99 },
    { name: "Coca-Cola", quantity: 2, price: 2.50 },
  ];

  return (
    <div className="container mx-auto py-12 px-4 max-w-3xl">
      <Card className="shadow-xl">
        <CardHeader className="text-center items-center">
          <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
          <CardTitle className="text-3xl font-lora text-primary">Order Confirmed!</CardTitle>
          <CardDescription className="text-lg">Thank you for your order. Your delicious meal is being prepared.</CardDescription>
          <p className="text-sm text-muted-foreground pt-2">Order ID: {orderId}</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="border rounded-lg p-6">
            <h2 className="text-xl font-lora font-semibold mb-4 flex items-center"><ShoppingBag className="mr-2 h-5 w-5 text-primary"/>Invoice Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <h3 className="font-semibold text-muted-foreground">Billed To:</h3>
                <p>{mockUser.name}</p>
                <p>{mockUser.email}</p>
              </div>
              <div className="md:text-right">
                <h3 className="font-semibold text-muted-foreground">Invoice Date:</h3>
                <p>{currentDate}</p>
                <h3 className="font-semibold text-muted-foreground mt-1">Order Type:</h3>
                <p>{orderType.charAt(0).toUpperCase() + orderType.slice(1)}</p>
              </div>
            </div>

            <Separator className="my-4" />

            <h3 className="font-semibold text-muted-foreground mb-2">Order Summary:</h3>
            <div className="space-y-1 text-sm mb-4">
              {mockOrderItems.map(item => (
                <div key={item.name} className="flex justify-between">
                  <span>{item.name} x {item.quantity}</span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            
            <Separator className="my-4" />
            
            <div className="flex justify-between items-center font-bold text-lg mt-2">
              <span>Total Amount Paid:</span>
              <span className="text-primary">${parseFloat(totalAmount).toFixed(2)}</span>
            </div>
            <p className="text-xs text-muted-foreground text-right mt-1">(inclusive of all taxes)</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="outline" className="w-full sm:w-auto">
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

export default function ConfirmationPage(props: ConfirmationPageProps) {
 return (
    <Suspense fallback={<div className="container mx-auto py-12 text-center">Loading confirmation...</div>}>
      <ConfirmationPageContent {...props} />
    </Suspense>
  );
}
