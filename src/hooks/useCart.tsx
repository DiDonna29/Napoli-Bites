
// src/hooks/useCart.tsx
"use client";

import type { ReactNode } from 'react';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { OrderItem, Pizza, Drink, PizzaSizeOption, PizzaAddon } from '@/types';
import { useToast } from '@/hooks/use-toast';

const CART_STORAGE_KEY = 'napoliBitesCart';
const MAX_ITEM_QUANTITY = 5;

interface CartContextType {
  cartItems: OrderItem[];
  addToCart: (item: Pizza | Drink, type: 'pizza' | 'drink', quantity?: number, size?: PizzaSizeOption, addons?: PizzaAddon[]) => void;
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
  const { toast } = useToast();

  useEffect(() => {
    const storedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (storedCart) {
      setCartItems(JSON.parse(storedCart));
    }
  }, []);

  const saveCart = useCallback((items: OrderItem[]) => {
    setCartItems(items);
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, []);

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
    item: Pizza | Drink, 
    type: 'pizza' | 'drink', 
    quantity: number = 1, 
    selectedSize?: PizzaSizeOption, 
    selectedAddons?: PizzaAddon[]
  ) => {
    let unitPrice = 0;
    let itemName = item.name;
    let cartItemId: string;

    if (type === 'pizza') {
      const pizza = item as Pizza;
      const sizeToUse = selectedSize || pizza.sizes[0]; // Default to first size if not provided
      unitPrice = pizza.basePrice + sizeToUse.price;
      itemName = `${pizza.name} (${sizeToUse.name})`;
      
      if (selectedAddons && selectedAddons.length > 0) {
        unitPrice += selectedAddons.reduce((sum, addon) => sum + addon.price, 0);
        // itemName += ` w/ ${selectedAddons.map(a => a.name).join(', ')}`; // Could make name too long
      }
      cartItemId = generateCartItemId(pizza.id, sizeToUse, selectedAddons);
    } else {
      const drink = item as Drink;
      unitPrice = drink.price;
      cartItemId = generateCartItemId(drink.id);
    }

    setCartItems(prevItems => {
      const existingItem = prevItems.find(ci => ci.cartItemId === cartItemId);
      let newItems;
      if (existingItem) {
        const newQuantity = Math.min(existingItem.quantity + quantity, MAX_ITEM_QUANTITY);
        if (newQuantity > existingItem.quantity) {
           toast({ title: "Quantity Updated", description: `${itemName} quantity increased to ${newQuantity}.` });
        } else if (newQuantity === existingItem.quantity && quantity > 0) {
           toast({ title: "Max Quantity", description: `You can only add up to ${MAX_ITEM_QUANTITY} of ${itemName}.`, variant: "destructive" });
        }
        newItems = prevItems.map(ci =>
          ci.cartItemId === cartItemId ? { ...ci, quantity: newQuantity, totalPrice: unitPrice * newQuantity } : ci
        );
      } else {
        if (quantity > MAX_ITEM_QUANTITY) {
            toast({ title: "Max Quantity", description: `Cannot add ${itemName}. Max quantity is ${MAX_ITEM_QUANTITY}.`, variant: "destructive" });
            return prevItems; // Do not add if initial quantity exceeds max
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
        newItems = [...prevItems, newItem];
        toast({ title: "Item Added", description: `${itemName} added to your cart.` });
      }
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(newItems));
      return newItems;
    });
  }, [toast]);


  const removeFromCart = useCallback((cartItemId: string) => {
    setCartItems(prevItems => {
      const itemToRemove = prevItems.find(item => item.cartItemId === cartItemId);
      const newItems = prevItems.filter(item => item.cartItemId !== cartItemId);
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(newItems));
      if (itemToRemove) {
        toast({ title: "Item Removed", description: `${itemToRemove.name} removed from cart.` });
      }
      return newItems;
    });
  }, [toast]);

  const updateQuantity = useCallback((cartItemId: string, newQuantity: number) => {
    const updatedQuantity = Math.max(1, Math.min(newQuantity, MAX_ITEM_QUANTITY));
    setCartItems(prevItems => {
      const itemToUpdate = prevItems.find(item => item.cartItemId === cartItemId);
      const newItems = prevItems.map(item =>
        item.cartItemId === cartItemId ? { ...item, quantity: updatedQuantity, totalPrice: item.unitPrice * updatedQuantity } : item
      );
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(newItems));
       if (itemToUpdate && updatedQuantity === MAX_ITEM_QUANTITY && newQuantity > MAX_ITEM_QUANTITY) {
         toast({ title: "Max Quantity Reached", description: `Cannot add more than ${MAX_ITEM_QUANTITY} of ${itemToUpdate.name}.`, variant: "destructive" });
       } else if (itemToUpdate) {
         toast({ title: "Quantity Updated", description: `${itemToUpdate.name} quantity set to ${updatedQuantity}.` });
       }
      return newItems;
    });
  }, [toast]);

  const clearCart = useCallback(() => {
    setCartItems([]);
    localStorage.removeItem(CART_STORAGE_KEY);
    toast({ title: "Cart Cleared", description: "Your shopping cart is now empty." });
  }, [toast]);

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
