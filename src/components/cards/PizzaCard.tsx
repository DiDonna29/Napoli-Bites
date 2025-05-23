import Image from 'next/image';
import type { Pizza, PizzaSizeOption, PizzaAddon } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, ShoppingCart } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useState } from 'react';

interface PizzaCardProps {
  pizza: Pizza;
}

export function PizzaCard({ pizza }: PizzaCardProps) {
  const [selectedSize, setSelectedSize] = useState<PizzaSizeOption>(pizza.sizes[0]);
  const [selectedAddons, setSelectedAddons] = useState<PizzaAddon[]>([]);

  const handleSizeChange = (sizeId: string) => {
    const newSize = pizza.sizes.find(s => s.id === sizeId) || pizza.sizes[0];
    setSelectedSize(newSize);
  };

  // In a real app, adding to cart would involve a cart context/store
  const handleAddToCart = () => {
    console.log('Add to cart:', pizza.name, selectedSize.name, selectedAddons.map(a => a.name));
    // Show a toast notification (requires useToast hook)
  };
  
  const totalPrice = pizza.basePrice + selectedSize.price + selectedAddons.reduce((sum, addon) => sum + addon.price, 0);

  return (
    <Card className="w-full overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="p-0">
        <div className="aspect-[3/2] relative">
          <Image
            src={pizza.imageUrl}
            alt={pizza.name}
            layout="fill"
            objectFit="cover"
            data-ai-hint={pizza.imageHint || "pizza food"}
          />
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <CardTitle className="text-xl font-lora mb-1">{pizza.name}</CardTitle>
        <CardDescription className="text-sm text-muted-foreground h-12 overflow-hidden text-ellipsis">
          {pizza.description}
        </CardDescription>
        
        <div className="mt-3">
          <Select onValueChange={handleSizeChange} defaultValue={selectedSize.id}>
            <SelectTrigger className="w-full mb-2">
              <SelectValue placeholder="Select size" />
            </SelectTrigger>
            <SelectContent>
              {pizza.sizes.map((size) => (
                <SelectItem key={size.id} value={size.id}>
                  {size.name} (+${size.price.toFixed(2)})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {/* Addon selection can be more complex, e.g. a modal with checkboxes */}
        <Button variant="outline" size="sm" className="w-full text-xs mt-1" onClick={() => alert("Addon selection UI to be implemented. Max 5 addons.")}>
            <PlusCircle className="mr-1 h-3 w-3" /> Add Add-ons (Max 5)
        </Button>

      </CardContent>
      <CardFooter className="p-4 flex justify-between items-center">
        <p className="text-xl font-semibold text-accent-foreground">${totalPrice.toFixed(2)}</p>
        <Button className="bg-accent hover:bg-accent/90 text-accent-foreground" onClick={handleAddToCart}>
          <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
}
