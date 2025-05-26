
// src/app/(main)/cart/page.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { MinusCircle, PlusCircle, ShoppingCart, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/hooks/useCart";
import { useRouter } from "next/navigation";

const TAX_RATE = 0.1; // Example 10% tax

export default function CartPage() {
  const { cartItems, removeFromCart, updateQuantity, getCartSubtotal, clearCart } = useCart();
  const router = useRouter();

  const subtotal = getCartSubtotal();
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;

  const handleProceedToCheckout = () => {
    if (cartItems.length === 0) {
      // This should ideally not happen if button is disabled, but as a fallback
      alert("Your cart is empty. Please add items to your order.");
      return;
    }
    // The order type and address are not collected on this page.
    // They are collected on the /order page or passed as params.
    // For checkout, we primarily need the cart items.
    // The /checkout page will pick up cart from localStorage (managed by useCart).
    // It might need to know the order type (delivery, pickup, dine-in) to show relevant info.
    // For now, let's assume default flow from here goes to a generic checkout.
    // Or, we could redirect to /order page if more info is needed.
    // Let's push directly to checkout, assuming order page context is set or not strictly needed for checkout initiation here.
    router.push('/checkout'); 
  };


  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-4xl font-lora font-bold text-center mb-10 text-primary">Your Shopping Cart</h1>

      {cartItems.length === 0 ? (
        <Card className="text-center py-12">
           <CardHeader>
            <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <CardTitle>Your Cart is Empty</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>Looks like you haven&apos;t added anything to your cart yet.</CardDescription>
          </CardContent>
          <CardFooter className="justify-center">
            <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Link href="/#menu">Browse Menu</Link>
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {cartItems.map(item => (
              <Card key={item.cartItemId} className="flex items-center p-4 shadow-md">
                <Image
                  src={item.imageUrl || "https://placehold.co/100x100.png"}
                  alt={item.name}
                  width={80}
                  height={80}
                  className="rounded-md object-cover"
                  data-ai-hint={item.imageHint || (item.type === 'pizza' ? "pizza food" : "drink beverage")}
                />
                <div className="ml-4 flex-grow">
                  <h3 className="font-semibold">{item.name}</h3>
                  <p className="text-sm text-muted-foreground">${item.unitPrice.toFixed(2)} each</p>
                  {item.type === 'pizza' && item.selectedAddons && item.selectedAddons.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      Add-ons: {item.selectedAddons.map(a => a.name).join(', ')}
                    </p>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)} disabled={item.quantity <= 1}>
                    <MinusCircle className="h-4 w-4" />
                  </Button>
                  <span>{item.quantity}</span>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)} disabled={item.quantity >= 5}>
                    <PlusCircle className="h-4 w-4" />
                  </Button>
                </div>
                <p className="ml-4 font-semibold w-20 text-right">${item.totalPrice.toFixed(2)}</p>
                <Button variant="ghost" size="icon" className="ml-2 text-destructive hover:text-destructive/80 h-7 w-7" onClick={() => removeFromCart(item.cartItemId)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </Card>
            ))}
          </div>

          <Card className="lg:col-span-1 shadow-lg h-fit sticky top-24">
            <CardHeader>
              <CardTitle className="text-xl font-lora">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Estimated Tax ({ (TAX_RATE * 100).toFixed(0) }%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              {/* <div className="flex justify-between text-sm">
                <span>Delivery Fee</span>
                <span className="text-green-600">Free</span> 
              </div> */}
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-primary">${total.toFixed(2)}</span>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-3">
              <Button 
                size="lg" 
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" 
                onClick={handleProceedToCheckout}
                disabled={cartItems.length === 0}
              >
                Proceed to Checkout
              </Button>
              <Button variant="outline" className="w-full" asChild>
                 <Link href="/#menu">Continue Shopping</Link>
              </Button>
               <Button variant="ghost" size="sm" className="w-full text-destructive hover:text-destructive/80" onClick={clearCart}>
                 Clear Cart
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}
