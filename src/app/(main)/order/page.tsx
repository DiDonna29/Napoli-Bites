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
import type { Pizza, Drink } from "@/types";
import Image from "next/image";
import Link from "next/link";
import { useState, Suspense } from "react";
import { useSearchParams } from 'next/navigation';
import { ShoppingCart, Utensils, Bike, Package } from "lucide-react";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  type: 'pizza' | 'drink';
}

function OrderPageContent() {
  const searchParams = useSearchParams();
  const initialOrderType = searchParams.get('type') || 'delivery';
  const initialTableId = searchParams.get('table');

  const [orderType, setOrderType] = useState(initialOrderType);
  const [address, setAddress] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = (item: Pizza | Drink, type: 'pizza' | 'drink') => {
    setCart(prevCart => {
      const existingItem = prevCart.find(ci => ci.id === item.id);
      if (existingItem) {
        return prevCart.map(ci => ci.id === item.id ? { ...ci, quantity: ci.quantity + 1 } : ci);
      }
      return [...prevCart, { id: item.id, name: item.name, price: type === 'pizza' ? item.basePrice : item.price, quantity: 1, type }];
    });
  };

  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

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
                  <CardDescription className="text-xs">{pizza.description.substring(0,50)}...</CardDescription>
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
              <div key={item.id} className="flex justify-between items-center py-2 border-b">
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
            <Button size="lg" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" asChild>
              <Link href={`/checkout?orderType=${orderType}&total=${totalAmount.toFixed(2)}${orderType === 'delivery' && address ? `&address=${encodeURIComponent(address)}` : ''}${initialTableId ? `&tableId=${initialTableId}` : ''}`}>
                <ShoppingCart className="mr-2 h-5 w-5" /> Proceed to Checkout
              </Link>
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}


export default function OrderPage() {
  return (
    <Suspense fallback={<div>Loading order options...</div>}>
      <OrderPageContent />
    </Suspense>
  );
}
