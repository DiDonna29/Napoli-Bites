import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { MinusCircle, PlusCircle, ShoppingCart, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

// Mock cart data
const mockCartItems = [
  {
    id: "pizza-1",
    name: "Margherita (Medium)",
    price: 15.99,
    quantity: 1,
    imageUrl: "https://placehold.co/100x100.png",
    imageHint: "pizza margherita",
  },
  {
    id: "drink-1",
    name: "Coca-Cola",
    price: 2.50,
    quantity: 2,
    imageUrl: "https://placehold.co/100x100.png",
    imageHint: "drink soda",
  },
];

const subtotal = mockCartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
const tax = subtotal * 0.1; // Example 10% tax
const total = subtotal + tax;

export default function CartPage() {
  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-4xl font-lora font-bold text-center mb-10 text-primary">Your Shopping Cart</h1>

      {mockCartItems.length === 0 ? (
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
            {mockCartItems.map(item => (
              <Card key={item.id} className="flex items-center p-4 shadow-md">
                <Image
                  src={item.imageUrl}
                  alt={item.name}
                  width={80}
                  height={80}
                  className="rounded-md object-cover"
                  data-ai-hint={item.imageHint}
                />
                <div className="ml-4 flex-grow">
                  <h3 className="font-semibold">{item.name}</h3>
                  <p className="text-sm text-muted-foreground">${item.price.toFixed(2)}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <MinusCircle className="h-4 w-4" />
                  </Button>
                  <span>{item.quantity}</span>
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <PlusCircle className="h-4 w-4" />
                  </Button>
                </div>
                <p className="ml-4 font-semibold w-20 text-right">${(item.price * item.quantity).toFixed(2)}</p>
                <Button variant="ghost" size="icon" className="ml-2 text-red-500 hover:text-red-700 h-7 w-7">
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
                <span>Estimated Tax (10%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Delivery Fee</span>
                <span className="text-green-600">Free</span> {/* Placeholder */}
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-primary">${total.toFixed(2)}</span>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-3">
              <Button size="lg" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" asChild>
                <Link href="/checkout">Proceed to Checkout</Link>
              </Button>
              <Button variant="outline" className="w-full" asChild>
                 <Link href="/#menu">Continue Shopping</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}
