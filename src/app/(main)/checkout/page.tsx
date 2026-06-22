
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useSearchParams, useRouter } from 'next/navigation';
import { CreditCard, Loader2, MinusCircle, PlusCircle, Trash2, ArrowLeft, ShoppingBag } from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/firebase/config";
import { collection, addDoc, doc, updateDoc } from "firebase/firestore";
import type { Order } from "@/types";
import { useCart } from "@/hooks/useCart";
import Image from "next/image";
import Link from "next/link";
import images from '@/app/lib/placeholder-images.json';

const TAX_RATE = 0.10;

function CheckoutPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, userData, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const { cartItems, updateQuantity, removeFromCart, getCartSubtotal, clearCart: clearCartHook } = useCart();

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
        description: "Por favor, inicia sesión para continuar con el pedido.",
        variant: "destructive",
      });
      const redirectParams = new URLSearchParams(searchParams.toString());
      router.push(`/login?redirect=/checkout%3F${redirectParams.toString()}`);
    }

    if (!authLoading && user && cartItems.length === 0 && isClient) {
      router.push('/order');
    }
  }, [user, authLoading, router, toast, searchParams, cartItems, isClient]);

  const handleSimulatePayment = async () => {
    if (!user) return;
    if (cartItems.length === 0) {
      toast({ title: "Carrito vacío", description: "Añade productos antes de confirmar.", variant: "destructive" });
      return;
    }
    
    setIsProcessing(true);
    try {
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

      if (orderType === 'dine-in' && tableId) {
        const tableDocRef = doc(db, "tables", tableId);
        await updateDoc(tableDocRef, {
          status: 'occupied',
          availabilityTime: 'Ocupada recientemente'
        });
      }

      clearCartHook();

      toast({ 
        title: "¡Pedido Confirmado!", 
        description: "Tu solicitud ha sido procesada con éxito." 
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
      <div className="container mx-auto py-12 px-4 text-center flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p>Cargando verificación de pedido...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12 px-4 max-w-4xl">
      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/cart"><ArrowLeft className="h-4 w-4 mr-1" /> Volver al Carrito</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-2xl font-lora text-primary">Verificar Pedido Final</CardTitle>
              <CardDescription>Revisa los artículos y cantidades antes de realizar la solicitud definitiva.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {cartItems.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p>Tu pedido está vacío.</p>
                </div>
              ) : (
                <div className="divide-y">
                  {cartItems.map(item => (
                    <div key={item.cartItemId} className="py-4 flex items-start gap-4">
                      <div className="relative h-20 w-20 flex-shrink-0">
                        <Image
                          src={item.imageUrl || images.cart_fallback.url}
                          alt={item.name}
                          fill
                          className="rounded-md object-cover border"
                        />
                      </div>
                      <div className="flex-grow">
                        <h4 className="font-bold text-sm">{item.name}</h4>
                        <p className="text-xs text-muted-foreground">${item.unitPrice.toFixed(2)} c/u</p>
                        {item.type === 'pizza' && item.selectedAddons && item.selectedAddons.length > 0 && (
                          <p className="text-[10px] text-muted-foreground italic mt-1">
                            Extras: {item.selectedAddons.map(a => a.name).join(', ')}
                          </p>
                        )}
                        
                        <div className="flex items-center gap-3 mt-3">
                          <div className="flex items-center border rounded-md px-2 py-1 bg-muted/20">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-6 w-6" 
                              onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                            >
                              <MinusCircle className="h-4 w-4" />
                            </Button>
                            <span className="text-sm font-bold w-6 text-center">{item.quantity}</span>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-6 w-6" 
                              onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                              disabled={item.quantity >= 5}
                            >
                              <PlusCircle className="h-4 w-4" />
                            </Button>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-destructive"
                            onClick={() => removeFromCart(item.cartItemId)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-sm">${item.totalPrice.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-md bg-muted/20">
            <CardHeader>
              <CardTitle className="text-lg">Detalles de Entrega / Reserva</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tipo de Pedido:</span>
                <span className="font-bold uppercase">{orderType === 'delivery' ? 'A Domicilio' : orderType === 'pickup' ? 'Para Recoger' : 'En Mesa'}</span>
              </div>
              {orderType === 'delivery' && address && (
                <div className="flex flex-col gap-1">
                  <span className="text-muted-foreground">Dirección:</span>
                  <p className="p-3 bg-white rounded border italic">{decodeURIComponent(address)}</p>
                </div>
              )}
              {orderType === 'dine-in' && tableId && (
                <div className="flex justify-between items-center p-3 bg-green-100 dark:bg-green-900/30 rounded border-green-200 text-green-700 dark:text-green-400">
                  <span className="font-medium">Mesa Asignada:</span>
                  <span className="font-bold text-lg">#{tableId.replace('table-', '')}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="shadow-lg sticky top-24 border-primary/20">
            <CardHeader>
              <CardTitle className="text-xl">Resumen Final</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Impuestos (10%)</span>
                  <span>${taxAmount.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-xl font-bold text-primary pt-2">
                  <span>Total</span>
                  <span>${finalTotal.toFixed(2)}</span>
                </div>
              </div>

              <div className="bg-amber-50 dark:bg-amber-950/30 p-4 rounded-lg border border-amber-200 dark:border-amber-800 text-[11px] text-amber-700 dark:text-amber-300">
                <p className="font-bold uppercase mb-1">Nota:</p>
                <p>Al hacer clic en "Confirmar Solicitud", tu pedido será enviado a cocina y la mesa (si aplica) quedará reservada inmediatamente.</p>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                size="lg" 
                className="w-full h-16 text-lg font-bold shadow-xl transition-all hover:scale-[1.02]" 
                onClick={handleSimulatePayment}
                disabled={isProcessing || cartItems.length === 0}
              >
                {isProcessing ? (
                  <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                ) : (
                  <CreditCard className="mr-2 h-6 w-6" />
                )}
                {isProcessing ? "Procesando..." : "Confirmar Solicitud Final"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto py-12 px-4 text-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
        <p>Cargando verificador...</p>
      </div>
    }>
      <CheckoutPageContent/>
    </Suspense>
  );
}
