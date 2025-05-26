
// src/app/(main)/admin/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/lib/firebase/config";
import { collection, getDocs, orderBy, query, doc, getDoc } from "firebase/firestore";
import type { Order, UserProfile } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, ShieldAlert, BarChart3, ExternalLink, Eye } from "lucide-react";
import Link from "next/link";

interface EnrichedOrder extends Order {
  userProfile?: Pick<UserProfile, 'displayName' | 'email'>; // Store only necessary fields
}


export default function AdminDashboardPage() {
  const { user, userData, loading: authLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<EnrichedOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading) {
      if (!user || !userData?.isAdmin) {
        router.replace("/"); // Redirect non-admins to home
        return;
      }

      const fetchOrdersAndUsers = async () => {
        setLoadingOrders(true);
        setError(null);
        try {
          const ordersRef = collection(db, "orders");
          const q = query(ordersRef, orderBy("createdAt", "desc"));
          const querySnapshot = await getDocs(q);
          const fetchedOrders: Order[] = [];
          querySnapshot.forEach((doc) => {
            fetchedOrders.push({ orderId: doc.id, ...doc.data() } as Order);
          });

          // Enrich orders with user data (optional, can be slow for many orders)
          // For a production app with many orders, consider denormalizing user name/email directly into the order
          // or implement server-side pagination and data fetching.
          // For now, we will fetch user data if not already on the order document
          const enrichedOrdersPromises = fetchedOrders.map(async (order) => {
            if (order.userDisplayName && order.userEmail) {
              return { ...order, userProfile: { displayName: order.userDisplayName, email: order.userEmail }};
            }
            if (order.userId) {
              try {
                const userDocRef = doc(db, "users", order.userId);
                const userDocSnap = await getDoc(userDocRef);
                if (userDocSnap.exists()) {
                  const userProfileData = userDocSnap.data() as UserProfile;
                  return { ...order, userProfile: { displayName: userProfileData.displayName, email: userProfileData.email } };
                }
              } catch (userFetchError) {
                console.warn(`Could not fetch user ${order.userId} for order ${order.orderId}:`, userFetchError);
              }
            }
            return { ...order, userProfile: { displayName: 'N/A', email: 'N/A' } };
          });

          const resolvedEnrichedOrders = await Promise.all(enrichedOrdersPromises);
          setOrders(resolvedEnrichedOrders);

        } catch (err) {
          console.error("Error fetching orders:", err);
          setError("Failed to load orders. Please try again.");
        } finally {
          setLoadingOrders(false);
        }
      };

      fetchOrdersAndUsers();
    }
  }, [user, userData, authLoading, router]);

  if (authLoading || loadingOrders) {
    return (
      <div className="container mx-auto py-12 px-4 text-center flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p>Loading Admin Dashboard...</p>
      </div>
    );
  }

  if (!userData?.isAdmin) {
    return (
      <div className="container mx-auto py-12 px-4 text-center">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <ShieldAlert className="mx-auto h-12 w-12 text-destructive mb-4" />
            <CardTitle>Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>You do not have permission to view this page.</CardDescription>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/">Return to Homepage</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto py-12 px-4 text-center">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <ShieldAlert className="mx-auto h-12 w-12 text-destructive mb-4" />
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>{error}</CardDescription>
          </CardContent>
           <CardFooter>
            <Button onClick={() => window.location.reload()} className="w-full">
              Retry
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-3xl font-lora font-bold text-primary mb-8">Admin Dashboard</h1>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="mr-2 h-6 w-6 text-primary" />
            Analytics Overview
          </CardTitle>
          <CardDescription>
            For detailed website and app analytics, please visit your Google Analytics dashboard.
            You can also embed reports from Google Looker Studio here for a more integrated experience.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Track user behavior, sales trends, popular items, and more to make data-driven decisions for Napoli Bites.
          </p>
        </CardContent>
        <CardFooter>
          <Button variant="outline" asChild>
            <a href="https://analytics.google.com/" target="_blank" rel="noopener noreferrer">
              Go to Google Analytics <ExternalLink className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>Showing all placed orders, newest first.</CardDescription>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <p className="text-muted-foreground">No orders found yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.orderId}>
                    <TableCell className="font-medium">#{order.orderId?.substring(0, 8)}...</TableCell>
                    <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                        <div>{order.userProfile?.displayName || 'N/A'}</div>
                        <div className="text-xs text-muted-foreground">{order.userProfile?.email || 'N/A'}</div>
                    </TableCell>
                    <TableCell>{order.orderType.charAt(0).toUpperCase() + order.orderType.slice(1)}</TableCell>
                    <TableCell>{order.items.reduce((acc, item) => acc + item.quantity, 0)}</TableCell>
                    <TableCell className="text-right">${order.totalAmount.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={order.status === "delivered" || order.status === "confirmed" ? "default" : "secondary"}
                        className={order.status === "delivered" || order.status === "confirmed" ? "bg-green-600 text-white" : ""}
                      >
                        {order.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/confirmation/${order.orderId}?total=${order.totalAmount.toFixed(2)}&orderType=${order.orderType}`}>
                           <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
         {orders.length > 0 && (
            <CardFooter className="text-sm text-muted-foreground">
                Showing {orders.length} order(s).
            </CardFooter>
        )}
      </Card>
    </div>
  );
}
