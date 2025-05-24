// src/app/(main)/order/page.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { PIZZAS_DATA, DRINKS_DATA } from "@/constants/menu";
import type { Pizza, Drink, OrderItem } from "@/types";
import Image from "next/image";
import Link from "next/link";
import { useState, Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from 'next/navigation';
import { ShoppingCart, Utensils, Bike, Package } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

function OrderPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const initialOrderType = searchParams.get('type') || 'delivery';
  const initialTableId = searchParams.get('table');

  const [orderType, setOrderType] = useState(initialOrderType);
  const [address, setAddress] = useState("");
  const [cart, setCart] = useState<OrderItem[]>([]);

  useEffect(() => {
    if (!authLoading && !user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to place an order.",
        variant: "destructive",
      });
      router.push(`/login?redirect=/order${searchParams.toString() ? '?' + searchParams.toString() : ''}`);
    }
  }, [user, authLoading, router, toast, searchParams]);

  const addToCart = (item: Pizza | Drink, type: 'pizza' | 'drink') => {
    setCart(prevCart => {
      const existingItem = prevCart.find(ci => ci.id === item.id && ci.type === type);
      if (existingItem) {
        return prevCart.map(ci => ci.id === item.id && ci.type === type ? { ...ci, quantity: ci.quantity + 1 } : ci);
      }
      const price = type === 'pizza' ? (item as Pizza).basePrice : (item as Drink).price;
      return [...prevCart, { id: item.id, name: item.name, price, quantity: 1, type }];
    });
     toast({ title: "Item Added", description: `${item.name} added to your order.` });
  };

  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleProceedToCheckout = () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to proceed to checkout.",
        variant: "destructive",
      });
      router.push('/login?redirect=/order');
      return;
    }
    if (orderType === 'delivery' && !address.trim()) {
      toast({
        title: "Address Required",
        description: "Please enter your delivery address.",
        variant: "destructive",
      });
      return;
    }
    // Save cart to localStorage to pass to checkout page
    localStorage.setItem('napoliBitesCart', JSON.stringify(cart));
    
    const checkoutParams = new URLSearchParams();
    checkoutParams.set('orderType', orderType);
    checkoutParams.set('total', totalAmount.toFixed(2));
    if (orderType === 'delivery' && address) checkoutParams.set('address', encodeURIComponent(address));
    if (initialTableId) checkoutParams.set('tableId', initialTableId);
    
    router.push(`/checkout?${checkoutParams.toString()}`);
  };
  
  if (authLoading) {
    return <div className="container mx-auto py-12 px-4 text-center">Loading user authentication...</div>;
  }
  
  if (!user && !authLoading) {
     // This will be handled by useEffect redirect, but good for initial render before effect runs
    return <div className="container mx-auto py-12 px-4 text-center">Redirecting to login...</div>;
  }


  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-4xl font-lora font-bold text-center mb-10 text-primary">Place Your Order</h1>

      {initialTableId && orderType === 'dine-in' && (
        <Card className="mb-8 bg-green-50 dark:bg-green-900/30 border-green-500">
          <CardHeader>
            <CardTitle className="text-green-700 dark:text-green-400">Dine-in Reservation</CardTitle>
            <CardDescription>You are reserving Table #{initialTableId}. Maximum 2 hours stay.</CardDescription>
          </CardHeader>
        </Card>
      )}

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>1. Select Order Type</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup defaultValue={orderType} onValueChange={setOrderType} className="flex flex-col sm:flex-row gap-4">
            <Label htmlFor="delivery" className="flex items-center space-x-2 border p-4 rounded-md hover:bg-accent/10 cursor-pointer has-[:checked]:bg-accent/20 has-[:checked]:border-primary">
              <RadioGroupItem value="delivery" id="delivery" /> 
              <Bike className="h-5 w-5 mr-1" /> Delivery
            </Label>
            <Label htmlFor="pickup" className="flex items-center space-x-2 border p-4 rounded-md hover:bg-accent/10 cursor-pointer has-[:checked]:bg-accent/20 has-[:checked]:border-primary">
              <RadioGroupItem value="pickup" id="pickup" />
              <Package className="h-5 w-5 mr-1" /> Pickup
            </Label>
            <Label htmlFor="dine-in" className="flex items-center space-x-2 border p-4 rounded-md hover:bg-accent/10 cursor-pointer has-[:checked]:bg-accent/20 has-[:checked]:border-primary">
              <RadioGroupItem value="dine-in" id="dine-in" />
              <Utensils className="h-5 w-5 mr-1" /> Dine-in
            </Label>
          </RadioGroup>
          {orderType === 'delivery' && (
            <div className="mt-6">
              <Label htmlFor="address" className="text-lg font-medium">Delivery Address</Label>
              <Textarea
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter your full address"
                className="mt-2 min-h-[100px]"
              />
            </div>
          )}
           {orderType === 'dine-in' && !initialTableId && (
            <p className="mt-4 text-sm text-muted-foreground">
              Please <Link href="/#tables" className="text-primary underline">select a table first</Link> to dine in.
            </p>
          )}
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>2. Choose Your Items</CardTitle>
        </CardHeader>
        <CardContent>
          <h3 className="text-2xl font-lora mb-4">Pizzas</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {PIZZAS_DATA.map(pizza => (
              <Card key={pizza.id} className="flex flex-col">
                <Image src={pizza.imageUrl} alt={pizza.name} data-ai-hint={pizza.imageHint || "pizza food"} width={300} height={200} className="w-full h-40 object-cover rounded-t-md" />
                <CardHeader className="flex-grow">
                  <CardTitle className="text-lg">{pizza.name}</CardTitle>
                  <CardDescription className="text-xs h-10 overflow-hidden text-ellipsis">{pizza.description}</CardDescription>
                </CardHeader>
                <CardContent className="py-2">
                  <p className="font-semibold">${pizza.basePrice.toFixed(2)}</p>
                </CardContent>
                <CardFooter>
                  <Button size="sm" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" onClick={() => addToCart(pizza, 'pizza')}>Add to Order</Button>
                </CardFooter>
              </Card>
            ))}
          </div>
          <Separator className="my-6" />
          <h3 className="text-2xl font-lora mb-4">Drinks</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
             {DRINKS_DATA.map(drink => (
              <Card key={drink.id} className="flex flex-col">
                <Image src={drink.imageUrl} alt={drink.name} data-ai-hint={drink.imageHint || "drink beverage"} width={200} height={200} className="w-full h-32 object-cover rounded-t-md" />
                <CardHeader className="flex-grow">
                  <CardTitle className="text-md">{drink.name}</CardTitle>
                </CardHeader>
                 <CardContent className="py-2">
                  <p className="font-semibold">${drink.price.toFixed(2)}</p>
                </CardContent>
                <CardFooter>
                  <Button size="sm" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" onClick={() => addToCart(drink, 'drink')}>Add to Order</Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {cart.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>3. Order Summary</CardTitle>
          </CardHeader>
          <CardContent>
            {cart.map(item => (
              <div key={`${item.id}-${item.type}`} className="flex justify-between items-center py-2 border-b">
                <div>
                  <p className="font-medium">{item.name} (x{item.quantity})</p>
                  <p className="text-sm text-muted-foreground">${item.price.toFixed(2)} each</p>
                </div>
                <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
              </div>
            ))}
            <div className="flex justify-between items-center mt-4 pt-2 border-t">
              <p className="text-xl font-bold">Total:</p>
              <p className="text-xl font-bold text-primary">${totalAmount.toFixed(2)}</p>
            </div>
          </CardContent>
          <CardFooter>
            <Button size="lg" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" onClick={handleProceedToCheckout} disabled={!user || (orderType === 'dine-in' && !initialTableId && orderType !== 'pickup' && orderType !== 'delivery')}>
                <ShoppingCart className="mr-2 h-5 w-5" /> Proceed to Checkout
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}

export default function OrderPage() {
  return (
    <Suspense fallback={<div className="container mx-auto py-12 px-4 text-center">Loading order options...</div>}>
      <OrderPageContent />
    </Suspense>
  );
}
