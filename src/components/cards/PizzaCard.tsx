
"use client";

import Image from 'next/image';
import type { Pizza, PizzaSizeOption, PizzaAddon } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, ShoppingCart, CheckSquare, Square } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from 'react';
import { useCart } from '@/hooks/useCart';
import { useToast } from "@/hooks/use-toast";

interface PizzaCardProps {
  pizza: Pizza;
}

const MAX_ADDONS = 5;

export function PizzaCard({ pizza }: PizzaCardProps) {
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [selectedSize, setSelectedSize] = useState<PizzaSizeOption>(pizza.sizes[0]);
  const [selectedAddons, setSelectedAddons] = useState<PizzaAddon[]>([]);
  const [isAddonDialogOpen, setIsAddonDialogOpen] = useState(false);

  const handleSizeChange = (sizeId: string) => {
    const newSize = pizza.sizes.find(s => s.id === sizeId) || pizza.sizes[0];
    setSelectedSize(newSize);
  };

  const handleAddonToggle = (addon: PizzaAddon, checked: boolean) => {
    setSelectedAddons(prevAddons => {
      if (checked) {
        if (prevAddons.length < MAX_ADDONS) {
          return [...prevAddons, addon];
        } else {
          toast({
            title: "Max Add-ons Reached",
            description: `You can select a maximum of ${MAX_ADDONS} add-ons.`,
            variant: "destructive",
          });
          // Manually uncheck the checkbox if it was programmatically checked to exceed limit
          // This requires direct DOM manipulation or a more complex state management for checkboxes
          // For now, toast is the primary feedback. The checkbox state will visually revert if an action is prevented.
          return prevAddons;
        }
      } else {
        return prevAddons.filter(a => a.id !== addon.id);
      }
    });
  };

  const handleAddToCart = () => {
    addToCart(pizza, 'pizza', 1, selectedSize, selectedAddons);
    // Reset addons for next selection if desired, or keep them
    // setSelectedAddons([]); 
  };
  
  const currentBasePrice = pizza.basePrice;
  const sizePriceAdjustment = selectedSize.price;
  const addonsPrice = selectedAddons.reduce((sum, addon) => sum + addon.price, 0);
  const totalPrice = currentBasePrice + sizePriceAdjustment + addonsPrice;

  return (
    <Card className="w-full overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
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
      <CardContent className="p-4 flex-grow">
        <CardTitle className="text-xl font-lora mb-1">{pizza.name}</CardTitle>
        <CardDescription className="text-sm text-muted-foreground h-12 overflow-hidden text-ellipsis">
          {pizza.description}
        </CardDescription>
        
        <div className="mt-3 space-y-2">
          <Select onValueChange={handleSizeChange} defaultValue={selectedSize.id}>
            <SelectTrigger className="w-full">
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

          <Dialog open={isAddonDialogOpen} onOpenChange={setIsAddonDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="w-full text-xs">
                <PlusCircle className="mr-1 h-3 w-3" /> 
                Add-ons ({selectedAddons.length}/{MAX_ADDONS})
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Customize Add-ons for {pizza.name}</DialogTitle>
                <DialogDescription>
                  Select up to {MAX_ADDONS} add-ons. Click save when you&apos;re done.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4 max-h-60 overflow-y-auto">
                {pizza.availableAddons.map(addon => (
                  <div key={addon.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`addon-${pizza.id}-${addon.id}`}
                      checked={selectedAddons.some(sa => sa.id === addon.id)}
                      onCheckedChange={(checked) => {
                        // If trying to check and already at max, prevent checking
                        if (checked && selectedAddons.length >= MAX_ADDONS && !selectedAddons.some(sa => sa.id === addon.id)) {
                           toast({
                            title: "Max Add-ons Reached",
                            description: `You can select a maximum of ${MAX_ADDONS} add-ons.`,
                            variant: "destructive",
                          });
                          return; // Prevent the state update by not calling handleAddonToggle
                        }
                        handleAddonToggle(addon, !!checked);
                      }}
                    />
                    <Label htmlFor={`addon-${pizza.id}-${addon.id}`} className="flex-grow cursor-pointer">
                      {addon.name}
                    </Label>
                    <span className="text-sm text-muted-foreground">(+${addon.price.toFixed(2)})</span>
                  </div>
                ))}
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button">Save Add-ons</Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
      <CardFooter className="p-4 flex justify-between items-center mt-auto">
        <p className="text-xl font-semibold text-accent-foreground">${totalPrice.toFixed(2)}</p>
        <Button className="bg-accent hover:bg-accent/90 text-accent-foreground" onClick={handleAddToCart}>
          <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
}
