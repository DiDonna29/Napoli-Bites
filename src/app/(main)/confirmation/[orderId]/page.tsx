
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, Download, ShoppingBag, Loader2, MapPin, Mail, Phone, Hash, Calendar } from "lucide-react";
import Link from "next/link";
import { useSearchParams, useParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/lib/firebase/config";
import { doc, getDoc } from "firebase/firestore";
import type { Order, OrderItem } from "@/types"; 
import { cn } from "@/lib/utils";

function ConfirmationPageContent() {
  const routeParams = useParams<{ orderId: string }>();
  const orderId = routeParams.orderId;

  const { user: authUser, loading: authLoading } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loadingOrder, setLoadingOrder] = useState(true);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!orderId) return;
      setLoadingOrder(true);
      try {
        const orderDocRef = doc(db, "orders", orderId);
        const orderDocSnap = await getDoc(orderDocRef);

        if (orderDocSnap.exists()) {
          setOrder({ ...orderDocSnap.data(), orderId: orderDocSnap.id } as Order);
        } else {
          setOrder(null);
        }
      } catch (error) {
        console.error("Error fetching order details:", error);
        setOrder(null);
      } finally {
        setLoadingOrder(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  if (authLoading || loadingOrder) {
    return (
      <div className="container mx-auto py-12 px-4 text-center flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Generando factura del pedido...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto py-12 px-4 max-w-3xl text-center">
        <Card>
          <CardContent className="p-8">
            <p className="text-xl text-destructive">Pedido no encontrado o ID incorrecto.</p>
            <Button asChild className="mt-4">
              <Link href="/">Volver al Inicio</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const subtotal = order.items.reduce((acc, item) => acc + item.totalPrice, 0);
  const tax = order.totalAmount - subtotal;

  return (
    <div className="container mx-auto py-12 px-4 max-w-3xl">
      <div className="mb-8 text-center flex flex-col items-center">
        <div className="bg-green-100 p-3 rounded-full mb-4">
          <CheckCircle className="h-12 w-12 text-green-600" />
        </div>
        <h1 className="text-3xl font-lora font-bold text-primary">¡Pago Realizado con Éxito!</h1>
        <p className="text-muted-foreground mt-2">Tu pedido ha sido confirmado y está en preparación.</p>
      </div>

      <Card className="shadow-2xl border-2 overflow-hidden bg-white">
        {/* Encabezado de la Factura / Negocio */}
        <div className="bg-primary p-8 text-primary-foreground flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className="h-10 w-10 fill-white">
                <circle cx="50" cy="50" r="45" />
                <text x="50" y="62" fontSize="28" fill="hsl(var(--primary))" textAnchor="middle" fontWeight="bold">NB</text>
              </svg>
              <span className="text-2xl font-bold font-lora">Napoli Bites</span>
            </div>
            <div className="text-sm opacity-90 space-y-1">
              <p className="flex items-center gap-2"><MapPin className="h-3 w-3" /> 123 Calle Pizzería, Nápoles, Italia</p>
              <p className="flex items-center gap-2"><Phone className="h-3 w-3" /> +39 0123 456789</p>
              <p className="flex items-center gap-2"><Mail className="h-3 w-3" /> facturacion@napolibites.com</p>
            </div>
          </div>
          <div className="text-center md:text-right">
            <h2 className="text-4xl font-bold tracking-tighter uppercase opacity-50 mb-1">Factura</h2>
            <div className="text-sm font-mono flex items-center justify-center md:justify-end gap-1">
              <Hash className="h-3 w-3" /> {order.orderId?.toUpperCase().substring(0, 12)}
            </div>
          </div>
        </div>

        <CardContent className="p-8">
          {/* Información del Cliente y Fecha */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-xs uppercase font-bold text-muted-foreground mb-2">Facturado a:</h3>
              <p className="font-bold text-lg">{order.userDisplayName}</p>
              <p className="text-sm text-muted-foreground">{order.userEmail}</p>
              {order.orderType === 'delivery' && order.deliveryAddress && (
                <div className="mt-2 text-sm">
                  <span className="font-semibold">Entrega en:</span>
                  <p className="italic">{order.deliveryAddress}</p>
                </div>
              )}
            </div>
            <div className="md:text-right">
              <h3 className="text-xs uppercase font-bold text-muted-foreground mb-2">Detalles del Pedido:</h3>
              <div className="space-y-1 text-sm">
                <p className="flex items-center md:justify-end gap-2"><Calendar className="h-3 w-3" /> {new Date(order.createdAt).toLocaleDateString('es-ES', { dateStyle: 'long' })}</p>
                <p><span className="font-semibold">Método:</span> {order.orderType === 'delivery' ? 'A Domicilio' : order.orderType === 'pickup' ? 'Para Recoger' : `En Mesa #${order.tableId}`}</p>
                <p><span className="font-semibold">Estado:</span> <span className="text-green-600 font-bold uppercase">{order.status}</span></p>
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Tabla de Productos */}
          <div className="mb-8">
            <div className="grid grid-cols-12 gap-2 text-xs font-bold uppercase text-muted-foreground pb-4 border-b">
              <div className="col-span-6 md:col-span-7">Descripción</div>
              <div className="col-span-2 text-center">Cant.</div>
              <div className="col-span-2 text-right">Precio</div>
              <div className="col-span-2 text-right">Total</div>
            </div>
            <div className="divide-y">
              {order.items.map((item: OrderItem, idx) => (
                <div key={`${item.productId}-${idx}`} className="grid grid-cols-12 gap-2 py-4 items-start">
                  <div className="col-span-6 md:col-span-7">
                    <p className="font-bold text-sm">{item.name}</p>
                    {item.size && <p className="text-xs text-muted-foreground">Tamaño: {item.size}</p>}
                    {item.selectedAddons && item.selectedAddons.length > 0 && (
                      <p className="text-[10px] text-muted-foreground mt-1 italic">
                        Extras: {item.selectedAddons.map(a => a.name).join(', ')}
                      </p>
                    )}
                  </div>
                  <div className="col-span-2 text-center text-sm font-medium">x{item.quantity}</div>
                  <div className="col-span-2 text-right text-sm text-muted-foreground">${item.unitPrice.toFixed(2)}</div>
                  <div className="col-span-2 text-right text-sm font-bold">${item.totalPrice.toFixed(2)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Resumen de Totales */}
          <div className="flex flex-col items-end space-y-2">
            <div className="flex justify-between w-full md:w-64 text-sm">
              <span className="text-muted-foreground">Subtotal:</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between w-full md:w-64 text-sm">
              <span className="text-muted-foreground">IVA (10%):</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between w-full md:w-64 pt-4 border-t-2">
              <span className="text-lg font-bold">TOTAL:</span>
              <span className="text-2xl font-bold text-primary">${order.totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>

        <CardFooter className="bg-muted/30 p-8 flex flex-col md:flex-row gap-4 items-center justify-between border-t">
          <p className="text-xs text-muted-foreground max-w-sm text-center md:text-left italic">
            Esta es una factura generada digitalmente para Napoli Bites. No es un comprobante fiscal real para efectos tributarios fuera de la simulación.
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => window.print()} className="gap-2">
              <Download className="h-4 w-4" /> Descargar PDF / Imprimir
            </Button>
            <Button size="sm" asChild className="gap-2">
              <Link href="/profile/orders">
                <ShoppingBag className="h-4 w-4" /> Mis Pedidos
              </Link>
            </Button>
          </div>
        </CardFooter>
      </Card>

      <div className="mt-8 text-center">
        <Button variant="link" asChild>
          <Link href="/">Volver a la Pizzería</Link>
        </Button>
      </div>
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto py-12 px-4 text-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
        <p>Cargando factura...</p>
      </div>
    }>
      <ConfirmationPageContent />
    </Suspense>
  );
}
