"use client"; // Required for client components

import { TABLES_DATA } from '@/constants/tables';
import { TableCard } from '@/components/cards/TableCard';

export function TableSection() {
  return (
    <section id="tables" className="py-16 lg:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-lora font-bold text-primary mb-4">Reserve Your Table</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Find the perfect spot for your Napoli Bites experience. Tables are reserved for a maximum of 2 hours.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {TABLES_DATA.map((table) => (
            <TableCard key={table.id} table={table} />
          ))}
        </div>
      </div>
    </section>
  );
}
