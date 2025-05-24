// src/app/(main)/profile/orders/page.tsx
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ListOrdered, FileText, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/lib/firebase/config";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { useEffect, useState } from "react";
import type { Order } from "@/types";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

export default function OrderHistoryPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to view your order history.",
        variant: "destructive",
      });
      router.push('/login?redirect=/profile/orders');
      return;
    }

    const fetchOrders = async () => {
      if (user) {
        setLoadingOrders(true);
        try {
          const ordersRef = collection(db, "orders");
          const q = query(ordersRef, where("userId", "==", user.uid), orderBy("createdAt", "desc"));
          const querySnapshot = await getDocs(q);
          const fetchedOrders: Order[] = [];
          querySnapshot.forEach((doc) => {
            fetchedOrders.push({ orderId: doc.id, ...doc.data() } as Order);
          });
          setOrders(fetchedOrders);
        } catch (error) {
          console.error("Error fetching orders:", error);
          toast({ title: "Error", description: "Could not fetch your orders.", variant: "destructive"});
        } finally {
          setLoadingOrders(false);
        }
      }
    };

    if (!authLoading && user) {
      fetchOrders();
    }
  }, [user, authLoading, router, toast]);

  if (authLoading || loadingOrders) {
    return (
      <div className="container mx-auto py-12 px-4 text-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
        <p>Loading order history...</p>
      </div>
    );
  }
  
  if (!user && !authLoading) {
     return <div className="container mx-auto py-12 px-4 text-center">Redirecting to login...</div>;
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="flex items-center justify-between mb-10">
        <h1 className="text-4xl font-lora font-bold text-primary">My Orders</h1>
        {/* <Link href="/profile" className="text-sm text-primary hover:underline">
          Back to Profile
        </Link> */}
      </div>

      {orders.length === 0 ? (
        <Card className="text-center py-12">
          <CardHeader>
            <ListOrdered className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <CardTitle>No Orders Yet</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>You haven&apos;t placed any orders with us. Start exploring our menu!</CardDescription>
          </CardContent>
          <CardFooter className="justify-center">
            <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Link href="/#menu">Browse Menu</Link>
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <div className="space-y-8">
          {orders.map((order) => (
            <Card key={order.orderId} className="shadow-lg">
              <CardHeader className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <CardTitle className="text-xl">Order #{order.orderId?.substring(0, 8)}...</CardTitle>
                  <CardDescription>Date: {new Date(order.createdAt).toLocaleDateString()}</CardDescription>
                </div>
                <div className="md:text-center">
                    <p className="text-sm text-muted-foreground">Type</p>
                    <p className="font-semibold">{order.orderType.charAt(0).toUpperCase() + order.orderType.slice(1)}</p>
                </div>
                <div className="md:text-right">
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-xl font-semibold text-primary">${order.totalAmount.toFixed(2)}</p>
                </div>
              </CardHeader>
              <CardContent>
                <Separator className="mb-4" />
                <h4 className="font-semibold mb-2 text-sm">Items:</h4>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  {order.items.map((item, index) => (
                    <li key={`${item.id}-${index}`}>{item.name} (x{item.quantity})</li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="flex justify-between items-center">
                <Badge 
                    variant={order.status === "delivered" || order.status === "confirmed" ? "default" : "secondary"}
                    className={order.status === "delivered" || order.status === "confirmed" ? "bg-green-600 text-white" : ""}
                >
                  {order.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </Badge>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/confirmation/${order.orderId}?total=${order.totalAmount.toFixed(2)}&orderType=${order.orderType}`}>
                    <FileText className="mr-2 h-4 w-4" /> View Invoice
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
