
"use client";

import { useEffect, useState } from 'react';
import { DessertCard } from '@/components/cards/DessertCard';
import { fetchDessertsFromApi } from '@/lib/api';
import type { Dessert } from '@/types';
import { Loader2 } from 'lucide-react';

export function DessertsMenuSection() {
  const [desserts, setDesserts] = useState<Dessert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDesserts() {
      const data = await fetchDessertsFromApi();
      setDesserts(data);
      setLoading(false);
    }
    loadDesserts();
  }, []);

  return (
    <section id="desserts" className="py-16 lg:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-lora font-bold text-primary mb-4">Sweet Bites</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Indulge in our exquisite selection of Italian-inspired desserts and pastries.
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading sweets...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {desserts.map((dessert) => (
              <DessertCard key={dessert.id} dessert={dessert} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
