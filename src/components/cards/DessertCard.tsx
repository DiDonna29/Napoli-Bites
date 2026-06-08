
"use client";

import Image from 'next/image';
import type { Dessert } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/hooks/useCart';

interface DessertCardProps {
  dessert: Dessert;
}

export function DessertCard({ dessert }: DessertCardProps) {
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    // In useCart, we need to handle desserts. For now, let's treat it similar to a drink but with 'dessert' type.
    // We'll update useCart hook in a following change if necessary, 
    // but the generic structure should work if we pass 'drink' or similar, 
    // though better to add 'dessert' to the union.
    addToCart(dessert as any, 'drink', 1);
  };

  return (
    <Card className="w-full overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
      <CardHeader className="p-0">
        <div className="aspect-video relative">
          <Image
            src={dessert.imageUrl}
            alt={dessert.name}
            layout="fill"
            objectFit="cover"
            data-ai-hint={dessert.imageHint || "dessert pastry"}
          />
        </div>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <CardTitle className="text-lg font-lora mb-1">{dessert.name}</CardTitle>
        {dessert.description && (
          <CardDescription className="text-xs text-muted-foreground h-8 overflow-hidden text-ellipsis">
            {dessert.description}
          </CardDescription>
        )}
      </CardContent>
      <CardFooter className="p-4 flex justify-between items-center mt-auto">
        <p className="text-lg font-semibold text-primary">${dessert.price.toFixed(2)}</p>
        <Button size="sm" className="bg-accent hover:bg-accent/90 text-accent-foreground" onClick={handleAddToCart}>
          <ShoppingCart className="mr-2 h-4 w-4" /> Add
        </Button>
      </CardFooter>
    </Card>
  );
}
