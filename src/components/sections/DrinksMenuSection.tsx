"use client"; // Required for client components like Button with onClick

import { DRINKS_DATA } from '@/constants/menu';
import { DrinkCard } from '@/components/cards/DrinkCard';

export function DrinksMenuSection() {
  return (
    <section id="drinks" className="py-16 lg:py-24 bg-secondary">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-lora font-bold text-primary mb-4">Beverages</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Quench your thirst with our selection of refreshing drinks.
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {DRINKS_DATA.map((drink) => (
            <DrinkCard key={drink.id} drink={drink} />
          ))}
        </div>
      </div>
    </section>
  );
}
