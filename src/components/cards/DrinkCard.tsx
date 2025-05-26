
"use client";

import Image from 'next/image';
import type { Drink } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/hooks/useCart';

interface DrinkCardProps {
  drink: Drink;
}

export function DrinkCard({ drink }: DrinkCardProps) {
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    addToCart(drink, 'drink', 1);
  };

  return (
    <Card className="w-full overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
      <CardHeader className="p-0">
        <div className="aspect-square relative">
          <Image
            src={drink.imageUrl}
            alt={drink.name}
            layout="fill"
            objectFit="cover"
            data-ai-hint={drink.imageHint || "drink beverage"}
          />
        </div>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <CardTitle className="text-lg font-lora mb-1">{drink.name}</CardTitle>
        {drink.description && (
          <CardDescription className="text-xs text-muted-foreground h-8 overflow-hidden text-ellipsis">
            {drink.description}
          </CardDescription>
        )}
        <p className="text-sm text-muted-foreground mt-1">{drink.volume}</p>
      </CardContent>
      <CardFooter className="p-4 flex justify-between items-center mt-auto">
        <p className="text-lg font-semibold text-accent-foreground">${drink.price.toFixed(2)}</p>
        <Button size="sm" className="bg-accent hover:bg-accent/90 text-accent-foreground" onClick={handleAddToCart}>
          <ShoppingCart className="mr-2 h-4 w-4" /> Add
        </Button>
      </CardFooter>
    </Card>
  );
}
