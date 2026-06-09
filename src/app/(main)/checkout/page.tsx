
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useSearchParams, useRouter } from 'next/navigation';
import { CreditCard, Loader2 } from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/firebase/config";
import { collection, addDoc, doc, updateDoc } from "firebase/firestore";
import type { Order } from "@/types";
import { useCart } from "@/hooks/useCart";

const TAX_RATE = 0.10;

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
      router.push('/order');
    }
  }, [user, authLoading, router, toast, searchParams, cartItems]);

  const handleSimulatePayment = async () => {
    if (!user) return;
    
    setIsProcessing(true);
    try {
      // 1. Crear el pedido
      const newOrder: Order = {
        userId: user.uid,
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

      // 2. Si es reserva de mesa, actualizar estado en la base de datos
      if (orderType === 'dine-in' && tableId) {
        const tableDocRef = doc(db, "tables", tableId);
        await updateDoc(tableDocRef, {
          status: 'occupied',
          availabilityTime: 'Ocupada recientemente'
        });
      }

      clearCartHook();

      toast({ 
        title: "¡Pago Exitoso!", 
        description: "Tu mesa ha sido reservada y el pedido confirmado." 
      });
      router.push(`/confirmation/${orderId}`);

    } catch (error: any) {
      console.error("Error al procesar pedido: ", error);
      toast({ 
        title: "Error", 
        description: "No se pudo completar la transacción.", 
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
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Detalles del Pedido</h3>
            <div className="bg-muted/30 p-4 rounded-lg text-sm">
              <p><strong>Tipo:</strong> {orderType === 'delivery' ? 'A Domicilio' : orderType === 'pickup' ? 'Para Recoger' : 'En Mesa'}</p>
              {orderType === 'delivery' && address && <p><strong>Dirección:</strong> {decodeURIComponent(address)}</p>}
              {orderType === 'dine-in' && tableId && <p className="text-green-600 font-bold"><strong>Mesa Reservada:</strong> #{tableId.replace('table-', '')}</p>}
            </div>
          </div>
          <Separator />
          <div className="space-y-3">
             <h3 className="text-lg font-semibold">Resumen de Compra</h3>
            {cartItems.map(item => (
                <div key={item.cartItemId} className="flex justify-between text-sm">
                    <span>{item.name} (x{item.quantity})</span>
                    <span>${item.totalPrice.toFixed(2)}</span>
                </div>
            ))}
          </div>
          <Separator />
          <div className="bg-primary/5 p-4 rounded-lg space-y-1">
            <div className="flex justify-between text-sm"><span>Subtotal:</span><span>${subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between text-sm"><span>IVA (10%):</span><span>${taxAmount.toFixed(2)}</span></div>
            <div className="flex justify-between font-bold text-xl pt-2"><span>Total:</span><span className="text-primary">${finalTotal.toFixed(2)}</span></div>
          </div>
           <Button 
                size="lg" 
                className="w-full h-16 text-lg bg-green-600 hover:bg-green-700" 
                onClick={handleSimulatePayment}
                disabled={isProcessing || cartItems.length === 0}
            >
              {isProcessing ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : <CreditCard className="mr-2 h-6 w-6"/>}
              {isProcessing ? "Procesando..." : "Confirmar Pago y Reservar Mesa"}
            </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="text-center py-20">Cargando...</div>}>
      <CheckoutPageContent/>
    </Suspense>
  );
}
