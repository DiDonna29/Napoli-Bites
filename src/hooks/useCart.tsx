
// src/hooks/useCart.tsx
"use client";

import type { ReactNode } from 'react';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { OrderItem, Pizza, Drink, Dessert, PizzaSizeOption, PizzaAddon } from '@/types';
import { useToast } from '@/hooks/use-toast';

const CART_STORAGE_KEY = 'napoliBitesCart';
const MAX_ITEM_QUANTITY = 5;

interface CartContextType {
  cartItems: OrderItem[];
  addToCart: (item: Pizza | Drink | Dessert, type: 'pizza' | 'drink' | 'dessert', quantity?: number, size?: PizzaSizeOption, addons?: PizzaAddon[]) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, newQuantity: number) => void;
  clearCart: () => void;
  getCartSubtotal: () => number;
  getCartItemCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider = ({ children }: CartProviderProps) => {
  const [cartItems, setCartItems] = useState<OrderItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const { toast } = useToast();

  // Load cart from localStorage on mount
  useEffect(() => {
    const storedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (storedCart) {
      try {
        setCartItems(JSON.parse(storedCart));
      } catch (e) {
        console.error("Error parsing stored cart:", e);
      }
    }
    setIsInitialized(true);
  }, []);

  // Persist cart to localStorage whenever it changes
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    }
  }, [cartItems, isInitialized]);

  const generateCartItemId = (productId: string, size?: PizzaSizeOption, addons?: PizzaAddon[]): string => {
    let id = productId;
    if (size) {
      id += `_${size.id}`;
    }
    if (addons && addons.length > 0) {
      const sortedAddonIds = addons.map(a => a.id).sort().join('_');
      id += `_${sortedAddonIds}`;
    }
    return id;
  };

  const addToCart = useCallback((
    item: Pizza | Drink | Dessert, 
    type: 'pizza' | 'drink' | 'dessert', 
    quantity: number = 1, 
    selectedSize?: PizzaSizeOption, 
    selectedAddons?: PizzaAddon[]
  ) => {
    let unitPrice = 0;
    let itemName = item.name;
    let cartItemId: string;

    if (type === 'pizza') {
      const pizza = item as Pizza;
      const sizeToUse = selectedSize || pizza.sizes[0];
      unitPrice = pizza.basePrice + sizeToUse.price;
      itemName = `${pizza.name} (${sizeToUse.name})`;
      
      if (selectedAddons && selectedAddons.length > 0) {
        unitPrice += selectedAddons.reduce((sum, addon) => sum + addon.price, 0);
      }
      cartItemId = generateCartItemId(pizza.id, sizeToUse, selectedAddons);
    } else if (type === 'drink') {
      const drink = item as Drink;
      unitPrice = drink.price;
      cartItemId = generateCartItemId(drink.id);
    } else {
      const dessert = item as Dessert;
      unitPrice = dessert.price;
      cartItemId = generateCartItemId(dessert.id);
    }

    const existingItemIndex = cartItems.findIndex(ci => ci.cartItemId === cartItemId);
    const newCartItems = [...cartItems];

    if (existingItemIndex > -1) {
      const existingItem = newCartItems[existingItemIndex];
      const newQuantity = Math.min(existingItem.quantity + quantity, MAX_ITEM_QUANTITY);
      
      if (newQuantity > existingItem.quantity) {
        newCartItems[existingItemIndex] = { 
          ...existingItem, 
          quantity: newQuantity, 
          totalPrice: unitPrice * newQuantity 
        };
        setCartItems(newCartItems);
        toast({ title: "Cantidad Actualizada", description: `Aumentamos la cantidad de ${itemName} a ${newQuantity}.` });
      } else {
        toast({ 
          title: "Cantidad Máxima", 
          description: `Solo puedes pedir un máximo de ${MAX_ITEM_QUANTITY} unidades de ${itemName}.`, 
          variant: "destructive" 
        });
      }
    } else {
      if (quantity > MAX_ITEM_QUANTITY) {
        toast({ 
          title: "Cantidad Excedida", 
          description: `No podemos añadir ${itemName}. El máximo permitido es ${MAX_ITEM_QUANTITY}.`, 
          variant: "destructive" 
        });
        return;
      }
      
      const newItem: OrderItem = {
        cartItemId,
        productId: item.id,
        name: itemName,
        quantity,
        unitPrice,
        totalPrice: unitPrice * quantity,
        type,
        imageUrl: item.imageUrl,
        imageHint: item.imageHint,
        ...(type === 'pizza' && { 
          size: (selectedSize || (item as Pizza).sizes[0])?.name, 
          selectedAddons: selectedAddons || [] 
        }),
      };
      
      setCartItems([...cartItems, newItem]);
      toast({ title: "Producto Añadido", description: `${itemName} se agregó a tu carrito.` });
    }
  }, [cartItems, toast]);

  const removeFromCart = useCallback((cartItemId: string) => {
    const itemToRemove = cartItems.find(item => item.cartItemId === cartItemId);
    if (itemToRemove) {
      setCartItems(cartItems.filter(item => item.cartItemId !== cartItemId));
      toast({ title: "Producto Eliminado", description: `${itemToRemove.name} se quitó del carrito.` });
    }
  }, [cartItems, toast]);

  const updateQuantity = useCallback((cartItemId: string, newQuantity: number) => {
    const itemToUpdate = cartItems.find(item => item.cartItemId === cartItemId);
    if (!itemToUpdate) return;

    const validatedQuantity = Math.max(1, Math.min(newQuantity, MAX_ITEM_QUANTITY));
    
    if (validatedQuantity === itemToUpdate.quantity && newQuantity > MAX_ITEM_QUANTITY) {
      toast({ title: "Límite Alcanzado", description: `No puedes añadir más de ${MAX_ITEM_QUANTITY} de ${itemToUpdate.name}.`, variant: "destructive" });
      return;
    }

    const updatedItems = cartItems.map(item =>
      item.cartItemId === cartItemId 
        ? { ...item, quantity: validatedQuantity, totalPrice: item.unitPrice * validatedQuantity } 
        : item
    );
    
    setCartItems(updatedItems);
    toast({ title: "Carrito Actualizado", description: `La cantidad de ${itemToUpdate.name} ahora es ${validatedQuantity}.` });
  }, [cartItems, toast]);

  const clearCart = useCallback(() => {
    if (cartItems.length > 0) {
      setCartItems([]);
      toast({ title: "Carrito Vacío", description: "Hemos vaciado tu carrito de compras." });
    }
  }, [cartItems, toast]);

  const getCartSubtotal = useCallback(() => {
    return cartItems.reduce((sum, item) => sum + item.totalPrice, 0);
  }, [cartItems]);

  const getCartItemCount = useCallback(() => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  }, [cartItems]);

  return (
    <CartContext.Provider value={{ 
      cartItems, 
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      clearCart, 
      getCartSubtotal,
      getCartItemCount 
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
