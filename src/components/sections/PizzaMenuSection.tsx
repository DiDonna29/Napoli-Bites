"use client"; // Required for useState in PizzaCard

import { PIZZAS_DATA } from '@/constants/menu';
import { PizzaCard } from '@/components/cards/PizzaCard';

export function PizzaMenuSection() {
  return (
    <section id="menu" className="py-16 lg:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-lora font-bold text-primary mb-4">Our Pizzas</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Crafted with passion, from classic recipes to unique Napoli creations.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
          {PIZZAS_DATA.map((pizza) => (
            <PizzaCard key={pizza.id} pizza={pizza} />
          ))}
        </div>
      </div>
    </section>
  );
}
