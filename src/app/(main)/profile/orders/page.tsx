
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ListOrdered, FileText, Loader2, AlertCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/lib/firebase/config";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import type { Order } from "@/types";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/context/LanguageContext";

export default function OrderHistoryPage() {
  const { user, loading: authLoading } = useAuth();
  const { t } = useTranslation();
  const router = useRouter();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/profile/orders');
      return;
    }

    const fetchOrders = async () => {
      if (user) {
        setLoadingOrders(true);
        setError(false);
        try {
          const ordersRef = collection(db, "orders");
          // Quitamos el orderBy aquí para evitar el error de índice faltante en Firebase
          const q = query(ordersRef, where("userId", "==", user.uid));
          const querySnapshot = await getDocs(q);
          const fetchedOrders: Order[] = [];
          
          querySnapshot.forEach((doc) => {
            fetchedOrders.push({ orderId: doc.id, ...doc.data() } as Order);
          });

          // Ordenamos en el cliente para asegurar que aparezcan las más recientes arriba
          const sortedOrders = fetchedOrders.sort((a, b) => b.createdAt - a.createdAt);
          setOrders(sortedOrders);
        } catch (err) {
          console.error("Error fetching orders:", err);
          setError(true);
          toast({ title: "Error", description: "No se pudieron cargar tus pedidos.", variant: "destructive"});
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
      <div className="container mx-auto py-24 px-4 text-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
        <p className="text-muted-foreground">{t('orders.loading')}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12 px-4 max-w-5xl">
      <div className="flex items-center justify-between mb-10">
        <h1 className="text-4xl font-lora font-bold text-primary">{t('orders.title')}</h1>
      </div>

      {error && (
        <Card className="border-destructive mb-6 bg-destructive/5">
          <CardContent className="pt-6 flex items-center gap-3">
            <AlertCircle className="text-destructive h-5 w-5" />
            <p className="text-sm">Hubo un problema al conectar con el servidor. Revisa tu conexión.</p>
          </CardContent>
        </Card>
      )}

      {orders.length === 0 ? (
        <Card className="text-center py-16 shadow-inner bg-muted/20 border-dashed">
          <CardHeader>
            <div className="bg-muted h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <ListOrdered className="h-10 w-10 text-muted-foreground" />
            </div>
            <CardTitle className="text-2xl">{t('orders.noOrders')}</CardTitle>
            <CardDescription className="max-w-md mx-auto">{t('orders.noOrdersDesc')}</CardDescription>
          </CardHeader>
          <CardFooter className="justify-center pt-6">
            <Button asChild size="lg">
              <Link href="/#menu">{t('orders.browse')}</Link>
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <div className="grid gap-6">
          {orders.map((order) => (
            <Card key={order.orderId} className="shadow-md hover:shadow-lg transition-all border-l-4 border-l-primary">
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle className="text-lg">#{order.orderId?.toUpperCase().substring(0, 8)}</CardTitle>
                  <CardDescription>{new Date(order.createdAt).toLocaleDateString('es-ES', { dateStyle: 'medium' })}</CardDescription>
                </div>
                <Badge 
                    variant={order.status === "delivered" || order.status === "confirmed" ? "default" : "secondary"}
                    className={order.status === "delivered" || order.status === "confirmed" ? "bg-green-600 text-white" : ""}
                >
                  {order.status.replace('_', ' ').toUpperCase()}
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-bold">{t('orders.type')}</p>
                    <p className="font-semibold">{order.orderType === 'delivery' ? 'Domicilio' : order.orderType === 'pickup' ? 'Recoger' : 'En Mesa'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-bold">{t('orders.items')}</p>
                    <p className="text-sm">{order.items.map(i => `${i.name} (x${i.quantity})`).join(', ')}</p>
                  </div>
                  <div className="md:text-right">
                    <p className="text-xs text-muted-foreground uppercase font-bold">{t('orders.total')}</p>
                    <p className="text-2xl font-bold text-primary">${order.totalAmount.toFixed(2)}</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t bg-muted/5 flex justify-end p-4">
                <Button variant="outline" size="sm" asChild className="gap-2">
                  <Link href={`/confirmation/${order.orderId}`}>
                    <FileText className="h-4 w-4" /> {t('orders.viewInvoice')}
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
