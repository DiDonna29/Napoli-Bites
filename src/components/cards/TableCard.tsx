import type { Table } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Armchair, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface TableCardProps {
  table: Table;
}

export function TableCard({ table }: TableCardProps) {
  const isAvailable = table.status === 'available';

  const handleReserveTable = () => {
    // Navigate to order page with table pre-selected for dine-in
    console.log(`Reserve table ${table.tableNumber}`);
  };

  return (
    <Card className={cn(
      "w-full shadow-lg hover:shadow-xl transition-shadow duration-300",
      isAvailable ? "bg-green-50 dark:bg-green-900/30 border-green-500" : "bg-red-50 dark:bg-red-900/30 border-red-500"
    )}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-lora">Table {table.tableNumber}</CardTitle>
          <Armchair className={cn("h-8 w-8", isAvailable ? "text-green-600" : "text-red-600")} />
        </div>
        <CardDescription className="text-sm">Capacity: {table.capacity} people</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2">
          {isAvailable ? (
            <CheckCircle2 className="h-5 w-5 text-green-600" />
          ) : (
            <XCircle className="h-5 w-5 text-red-600" />
          )}
          <span className={cn("font-medium", isAvailable ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400")}>
            {table.status.charAt(0).toUpperCase() + table.status.slice(1)}
          </span>
        </div>
        {!isAvailable && table.availabilityTime && (
          <div className="flex items-center space-x-2 mt-2 text-xs text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{table.availabilityTime}</span>
          </div>
        )}
      </CardContent>
      <CardFooter>
        {isAvailable ? (
          <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" asChild>
            <Link href={`/order?type=dine-in&table=${table.id}`}>Reserve & Order</Link>
          </Button>
        ) : (
          <Button className="w-full" variant="outline" disabled>
            Unavailable
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
