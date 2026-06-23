"use client";

import type { Table } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
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
      "w-full overflow-hidden transition-all duration-300 border-2 group",
      isAvailable && "bg-card hover:border-green-500/50",
      isOccupied && "bg-muted/30 grayscale-[0.5]",
      isReserved && "bg-muted/30"
    )}>
      <CardHeader className="pb-2 space-y-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <CardTitle className="text-xl md:text-2xl font-bold truncate">
              Mesa <span className="text-primary">{table.tableNumber}</span>
            </CardTitle>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              <Users className="h-3 w-3 mr-1 shrink-0" />
              <span className="truncate">Capacidad: {table.capacity}</span>
            </div>
          </div>
          <Armchair className={cn(
            "h-8 w-8 shrink-0 transition-transform group-hover:scale-110", 
            isAvailable ? "text-green-500" : isOccupied ? "text-destructive" : "text-accent"
          )} />
        </div>
      </CardHeader>
      
      <CardContent className="pb-4">
        <div className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider mb-3",
          isAvailable && "bg-green-500/10 text-green-600 border-green-500/20",
          isOccupied && "bg-destructive/10 text-destructive border-destructive/20",
          isReserved && "bg-accent/10 text-accent-foreground border-accent/20"
        )}>
          {isAvailable ? <CheckCircle className="h-3 w-3" /> : isOccupied ? <CircleOff className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
          {isAvailable ? 'Disponible' : isOccupied ? 'Ocupada' : 'Reservada'}
        </div>
        
        {!isAvailable && table.availabilityTime && (
          <p className="text-[10px] text-muted-foreground flex items-center gap-1 min-w-0">
            <Clock className="h-3 w-3 shrink-0" />
            <span className="truncate">{table.availabilityTime}</span>
          </p>
        )}
      </CardContent>

      <CardFooter className="pt-0">
        {isAvailable ? (
          <Button className="w-full font-bold shadow-sm" asChild size="sm">
            <Link href={`/order?type=dine-in&table=${table.id}`}>Reservar</Link>
          </Button>
        ) : (
          <Button className="w-full" variant="secondary" size="sm" disabled>
            No disponible
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}