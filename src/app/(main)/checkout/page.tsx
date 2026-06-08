
// src/app/(main)/checkout/page.tsx
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
    // Solo requerimos 'user' (la sesión activa). 'userData' (el perfil en BD) es opcional como respaldo.
    if (!user) { 
      toast({ 
        title: "Error", 
        description: "No se detectó una sesión activa. Por favor, reintenta iniciar sesión.", 
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
        // Usamos userData si existe, si no, lo que venga del objeto user de Firebase Auth
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
        description: "El pago simulado fue exitoso y tu pedido ha sido confirmado." 
      });
      router.push(`/confirmation/${orderId}?total=${finalTotal.toFixed(2)}&orderType=${orderType}`);

    } catch (error: any) {
      console.error("Error al crear el pedido: ", error);
      toast({ 
        title: "Error en el Pedido", 
        description: error.message || "No se pudo procesar tu pedido. Reintenta en unos momentos.", 
        variant: "destructive" 
      });
      setIsProcessing(false);
    }
  };
  
  if (authLoading || !isClient) {
    return (
      <div className="container mx-auto py-12 px-4 text-center flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p>Cargando checkout...</p>
      </div>
    );
  }

  if (!user && !authLoading) {
     return (
      <div className="container mx-auto py-12 px-4 text-center flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p>Redirigiendo al login...</p>
      </div>
    );
  }
  
  if (cartItems.length === 0 && !authLoading && user) {
    return (
      <div className="container mx-auto py-12 px-4 text-center">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <CardTitle>Tu Carrito está Vacío</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>Por favor agrega productos antes de proceder al pago.</CardDescription>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
              <Link href="/order">Ir a la Carta</Link>
            </Button>
          </CardFooter>
        </Card>
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
            <h3 className="text-lg font-semibold mb-2">Detalles del Pedido</h3>
            <div className="space-y-1 text-sm">
              <p><strong>Tipo:</strong> {orderType === 'delivery' ? 'A Domicilio' : orderType === 'pickup' ? 'Para Recoger' : 'En Mesa'}</p>
              {orderType === 'delivery' && address && <p><strong>Dirección:</strong> {decodeURIComponent(address)}</p>}
              {orderType === 'dine-in' && tableId && <p><strong>Mesa Reservada:</strong> #{tableId}</p>}
            </div>
          </div>
          <Separator />
          <div>
             <h3 className="text-lg font-semibold mb-2">Productos</h3>
            {cartItems.length > 0 ? (
                cartItems.map(item => (
                    <div key={item.cartItemId} className="flex justify-between items-start py-2 text-sm border-b last:border-b-0">
                        <div>
                            <p>{item.name} (x{item.quantity})</p>
                            {item.type === 'pizza' && item.selectedAddons && item.selectedAddons.length > 0 && (
                                <p className="text-xs text-muted-foreground pl-2">
                                    Extras: {item.selectedAddons.map(a => a.name).join(', ')}
                                </p>
                            )}
                        </div>
                        <span>${item.totalPrice.toFixed(2)}</span>
                    </div>
                ))
            ) : (
                <p className="text-sm text-muted-foreground">Carrito vacío.</p>
            )}
          </div>
          <Separator />
          <div>
            <h3 className="text-lg font-semibold mb-2">Resumen de Pago</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between"><span>Subtotal:</span><span>${subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>Impuestos ({ (TAX_RATE * 100).toFixed(0) }%):</span><span>${taxAmount.toFixed(2)}</span></div>
              <Separator className="my-1"/>
              <div className="flex justify-between font-bold text-lg"><span>Total a Pagar:</span><span className="text-primary">${finalTotal.toFixed(2)}</span></div>
            </div>
          </div>
           <Separator />
           <div className="text-center">
            <p className="text-sm text-muted-foreground mb-4">Serás redirigido para una simulación de pago segura.</p>
            <Button 
                size="lg" 
                className="w-full bg-green-600 hover:bg-green-700 text-white" 
                onClick={handleSimulatePayment}
                disabled={isProcessing || cartItems.length === 0 || !user}
            >
              {isProcessing ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <CreditCard className="mr-2 h-5 w-5"/>}
              {isProcessing ? "Procesando..." : "Simular Pago"}
            </Button>
           </div>
        </CardContent>
        <CardFooter>
            <p className="text-xs text-muted-foreground text-center w-full">
                Esta es una transacción de prueba. No se realizará ningún cargo real.
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
