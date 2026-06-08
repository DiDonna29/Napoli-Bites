"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { DRINKS_DATA } from "@/constants/menu";
import type { Pizza, Drink } from "@/types";
import Image from "next/image";
import Link from "next/link";
import { useState, Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from 'next/navigation';
import { ShoppingCart, Utensils, Bike, Package, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/hooks/useCart";
import { fetchPizzasFromApi } from "@/lib/api";

function OrderPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const { addToCart, cartItems, getCartSubtotal } = useCart();

  const initialOrderType = searchParams.get('type') || 'delivery';
  const initialTableId = searchParams.get('table');

  const [orderType, setOrderType] = useState(initialOrderType);
  const [address, setAddress] = useState("");
  const [pizzas, setPizzas] = useState<Pizza[]>([]);
  const [loadingPizzas, setLoadingPizzas] = useState(true);

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

  useEffect(() => {
    async function loadPizzas() {
      const data = await fetchPizzasFromApi();
      setPizzas(data);
      setLoadingPizzas(false);
    }
    loadPizzas();
  }, []);

  const handleAddToCart = (item: Pizza | Drink, type: 'pizza' | 'drink') => {
    if (type === 'pizza') {
      const pizza = item as Pizza;
      const defaultSize = pizza.sizes[0]; 
      addToCart(pizza, 'pizza', 1, defaultSize, []);
    } else {
      addToCart(item, 'drink', 1);
    }
  };

  const totalAmount = getCartSubtotal();

  const handleProceedToCheckout = () => {
    if (!user) {
      router.push('/login?redirect=/order');
      return;
    }
    if (orderType === 'delivery' && !address.trim()) {
      toast({ title: "Address Required", description: "Please enter your delivery address.", variant: "destructive" });
      return;
    }
    if (cartItems.length === 0) {
      toast({ title: "Empty Cart", description: "Please add items to your order before proceeding.", variant: "destructive" });
      return;
    }
    
    const checkoutParams = new URLSearchParams();
    checkoutParams.set('orderType', orderType);
    if (orderType === 'delivery' && address) checkoutParams.set('address', encodeURIComponent(address));
    if (initialTableId) checkoutParams.set('tableId', initialTableId);
    
    router.push(`/checkout?${checkoutParams.toString()}`);
  };
  
  if (authLoading) {
    return <div className="container mx-auto py-12 px-4 text-center">Loading user authentication...</div>;
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
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>2. Choose Your Items</CardTitle>
        </CardHeader>
        <CardContent>
          <h3 className="text-2xl font-lora mb-4">Pizzas</h3>
          {loadingPizzas ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {pizzas.map(pizza => (
                <Card key={pizza.id} className="flex flex-col">
                  <Image src={pizza.imageUrl} alt={pizza.name} data-ai-hint="pizza food" width={300} height={200} className="w-full h-40 object-cover rounded-t-md" />
                  <CardHeader className="flex-grow">
                    <CardTitle className="text-lg">{pizza.name}</CardTitle>
                    <CardDescription className="text-xs h-10 overflow-hidden text-ellipsis">{pizza.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="py-2">
                    <p className="font-semibold">From ${pizza.basePrice.toFixed(2)}</p>
                  </CardContent>
                  <CardFooter>
                    <Button size="sm" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" onClick={() => handleAddToCart(pizza, 'pizza')}>Add to Order</Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
          <Separator className="my-6" />
          <h3 className="text-2xl font-lora mb-4">Drinks</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
             {DRINKS_DATA.map(drink => (
              <Card key={drink.id} className="flex flex-col">
                <Image src={drink.imageUrl} alt={drink.name} data-ai-hint="drink beverage" width={200} height={200} className="w-full h-32 object-cover rounded-t-md" />
                <CardHeader className="flex-grow">
                  <CardTitle className="text-md">{drink.name}</CardTitle>
                </CardHeader>
                 <CardContent className="py-2">
                  <p className="font-semibold">${drink.price.toFixed(2)}</p>
                </CardContent>
                <CardFooter>
                  <Button size="sm" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" onClick={() => handleAddToCart(drink, 'drink')}>Add to Order</Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {cartItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>3. Order Summary</CardTitle>
          </CardHeader>
          <CardContent>
            {cartItems.map(item => (
              <div key={item.cartItemId} className="flex justify-between items-center py-2 border-b">
                <div>
                  <p className="font-medium">{item.name} (x{item.quantity})</p>
                  <p className="text-sm text-muted-foreground">${item.unitPrice.toFixed(2)} each</p>
                </div>
                <p className="font-semibold">${item.totalPrice.toFixed(2)}</p>
              </div>
            ))}
            <div className="flex justify-between items-center mt-4 pt-2 border-t">
              <p className="text-xl font-bold">Subtotal:</p>
              <p className="text-xl font-bold text-primary">${totalAmount.toFixed(2)}</p>
            </div>
          </CardContent>
          <CardFooter>
            <Button size="lg" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" onClick={handleProceedToCheckout}>
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
