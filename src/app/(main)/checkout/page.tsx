
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useSearchParams, useRouter } from 'next/navigation';
import Link from "next/link";
import { CreditCard, CheckCircle, Loader2, ShoppingCart } from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/firebase/config";
import { collection, addDoc } from "firebase/firestore";
import type { Order } from "@/types";
import { useCart } from "@/hooks/useCart";

const TAX_RATE = 0.10; // 10% tax

function CheckoutPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, userData, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const { cartItems, getCartSubtotal, clearCart: clearCartHook } = useCart();

  const [isClient, setIsClient] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const orderType = searchParams.get('orderType') || 'delivery';
  const address = searchParams.get('address');
  const tableId = searchParams.get('tableId');

  const subtotal = getCartSubtotal();
  const taxAmount = subtotal * TAX_RATE;
  const finalTotal = subtotal + taxAmount;
  
  useEffect(() => {
    setIsClient(true);
    if (!authLoading && !user) {
      toast({
        title: "Autenticación Requerida",
        description: "Por favor, inicia sesión para continuar con el pago.",
        variant: "destructive",
      });
      const redirectParams = new URLSearchParams(searchParams.toString());
      router.push(`/login?redirect=/checkout%3F${redirectParams.toString()}`);
    }

    if (!authLoading && user && cartItems.length === 0) {
      toast({
        title: "Carrito Vacío",
        description: "Tu carrito está vacío. Agrega productos antes de pagar.",
        variant: "destructive",
      });
      router.push('/order');
    }
  }, [user, authLoading, router, toast, searchParams, cartItems]);

  const handleSimulatePayment = async () => {
    if (!user) { 
      toast({ 
        title: "Error", 
        description: "No se detectó una sesión activa.", 
        variant: "destructive" 
      });
      return;
    }
    
    if (cartItems.length === 0) {
      toast({ title: "Error", description: "Tu carrito está vacío.", variant: "destructive" });
      return;
    }

    setIsProcessing(true);
    try {
      const newOrder: Order = {
        userId: user.uid,
        // Guardamos explícitamente el nombre y email para la factura
        userDisplayName: userData?.displayName || user.displayName || 'Usuario Invitado', 
        userEmail: userData?.email || user.email || 'N/A',
        createdAt: Date.now(),
        status: 'confirmed',
        items: cartItems,
        totalAmount: finalTotal,
        orderType: orderType,
        ...(orderType === 'delivery' && address && { deliveryAddress: decodeURIComponent(address) }),
        ...(orderType === 'dine-in' && tableId && { tableId: tableId }),
      };

      const docRef = await addDoc(collection(db, "orders"), newOrder);
      const orderId = docRef.id;

      clearCartHook();

      toast({ 
        title: "¡Pedido Realizado!", 
        description: "Pago exitoso. Redirigiendo a tu factura..." 
      });
      router.push(`/confirmation/${orderId}`);

    } catch (error: any) {
      console.error("Error al crear el pedido: ", error);
      toast({ 
        title: "Error en el Pedido", 
        description: error.message || "No se pudo procesar tu pedido.", 
        variant: "destructive" 
      });
      setIsProcessing(false);
    }
  };
  
  if (authLoading || !isClient) {
    return (
      <div className="container mx-auto py-12 px-4 text-center flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p>Preparando entorno de pago seguro...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12 px-4 max-w-2xl">
      <Card className="shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-lora text-primary">Finalizar Pedido</CardTitle>
          <CardDescription>Revisa tu orden y completa el pago simulado.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2 underline decoration-accent/50 underline-offset-4">Detalles del Pedido</h3>
            <div className="space-y-1 text-sm bg-muted/30 p-4 rounded-lg">
              <p><strong>Tipo:</strong> {orderType === 'delivery' ? 'A Domicilio' : orderType === 'pickup' ? 'Para Recoger' : 'En Mesa'}</p>
              {orderType === 'delivery' && address && <p><strong>Dirección:</strong> {decodeURIComponent(address)}</p>}
              {orderType === 'dine-in' && tableId && <p><strong>Mesa Reservada:</strong> #{tableId}</p>}
            </div>
          </div>
          <Separator />
          <div>
             <h3 className="text-lg font-semibold mb-2">Resumen de Compra</h3>
            {cartItems.map(item => (
                <div key={item.cartItemId} className="flex justify-between items-start py-2 text-sm border-b last:border-b-0">
                    <div>
                        <p className="font-medium">{item.name} <span className="text-muted-foreground">(x{item.quantity})</span></p>
                        {item.size && <p className="text-[10px] text-muted-foreground">Tamaño: {item.size}</p>}
                    </div>
                    <span>${item.totalPrice.toFixed(2)}</span>
                </div>
            ))}
          </div>
          <Separator />
          <div className="bg-primary/5 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Desglose de Pago</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between"><span>Subtotal:</span><span>${subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>Impuestos ({ (TAX_RATE * 100).toFixed(0) }%):</span><span>${taxAmount.toFixed(2)}</span></div>
              <Separator className="my-2"/>
              <div className="flex justify-between font-bold text-xl"><span>Total a Pagar:</span><span className="text-primary">${finalTotal.toFixed(2)}</span></div>
            </div>
          </div>
           <Separator />
           <div className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">Haz clic para autorizar la transacción de prueba.</p>
            <Button 
                size="lg" 
                className="w-full h-16 text-lg bg-green-600 hover:bg-green-700 text-white transition-all shadow-lg hover:shadow-green-200" 
                onClick={handleSimulatePayment}
                disabled={isProcessing || cartItems.length === 0 || !user}
            >
              {isProcessing ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : <CreditCard className="mr-2 h-6 w-6"/>}
              {isProcessing ? "Procesando Transacción..." : "Autorizar Pago Simulado"}
            </Button>
           </div>
        </CardContent>
        <CardFooter>
            <p className="text-[10px] text-muted-foreground text-center w-full bg-muted/50 py-2 rounded">
                Simulador de pasarela de pagos. No se realizará ningún cargo a tarjetas reales. 
                Al pagar, se generará tu factura oficial de Napoli Bites.
            </p>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto py-12 px-4 text-center flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    }>
      <CheckoutPageContent/>
    </Suspense>
  );
}
