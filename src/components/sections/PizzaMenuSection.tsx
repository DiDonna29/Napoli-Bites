"use client";

import { useEffect, useState } from 'react';
import { PizzaCard } from '@/components/cards/PizzaCard';
import { fetchPizzasFromApi } from '@/lib/api';
import type { Pizza } from '@/types';
import { Loader2 } from 'lucide-react';

export function PizzaMenuSection() {
  const [pizzas, setPizzas] = useState<Pizza[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPizzas() {
      const data = await fetchPizzasFromApi();
      setPizzas(data);
      setLoading(false);
    }
    loadPizzas();
  }, []);

  return (
    <section id="menu" className="py-16 lg:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-lora font-bold text-primary mb-4">Our Pizzas</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Crafted with passion, using fresh data from our digital menu API.
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading authentic pizzas...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {pizzas.map((pizza) => (
              <PizzaCard key={pizza.id} pizza={pizza} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
