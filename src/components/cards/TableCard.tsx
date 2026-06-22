
"use client";

import type { Table } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Armchair, CheckCircle, CircleOff, Clock, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface TableCardProps {
  table: Table;
}

export function TableCard({ table }: TableCardProps) {
  const isAvailable = table.status === 'available';
  const isOccupied = table.status === 'occupied';
  const isReserved = table.status === 'reserved';

  return (
    <Card className={cn(
      "w-full shadow-lg hover:shadow-xl transition-all duration-300 border-2",
      isAvailable && "bg-green-50/50 dark:bg-green-950/20 border-green-200 dark:border-green-800",
      isOccupied && "bg-red-50/50 dark:bg-red-950/20 border-red-200 dark:border-red-800",
      isReserved && "bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800"
    )}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-lora">Mesa {table.tableNumber}</CardTitle>
            <div className="flex items-center text-sm text-muted-foreground mt-1">
              <Users className="h-3 w-3 mr-1" />
              <span>Capacidad: {table.capacity} pers.</span>
            </div>
          </div>
          <Armchair className={cn(
            "h-10 w-10 transition-colors", 
            isAvailable ? "text-green-600" : isOccupied ? "text-red-600" : "text-amber-600"
          )} />
        </div>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="flex items-center space-x-2 py-2 px-3 rounded-full bg-white/50 dark:bg-black/20 w-fit border">
          {isAvailable ? (
            <>
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-xs font-bold text-green-700 dark:text-green-400 uppercase tracking-wider">Disponible</span>
            </>
          ) : isOccupied ? (
            <>
              <CircleOff className="h-4 w-4 text-red-600" />
              <span className="text-xs font-bold text-red-700 dark:text-red-400 uppercase tracking-wider">Ocupada</span>
            </>
          ) : (
            <>
              <Clock className="h-4 w-4 text-amber-600" />
              <span className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">Reservada</span>
            </>
          )}
        </div>
        
        {!isAvailable && table.availabilityTime && (
          <p className="mt-3 text-xs text-muted-foreground flex items-center gap-1.5">
            <Clock className="h-3 w-3" />
            <span>Disponible {table.availabilityTime}</span>
          </p>
        )}
      </CardContent>
      <CardFooter>
        {isAvailable ? (
          <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-md" asChild>
            <Link href={`/order?type=dine-in&table=${table.id}`}>Reservar y Pedir</Link>
          </Button>
        ) : (
          <Button className="w-full" variant="secondary" disabled>
            No disponible ahora
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
