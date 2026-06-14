
"use client";

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase/config';
import { collection, onSnapshot, query, orderBy, getDocs, writeBatch, doc } from 'firebase/firestore';
import { TableCard } from '@/components/cards/TableCard';
import type { Table } from '@/types';
import { Loader2, RefreshCcw, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TABLES_DATA } from '@/constants/tables';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export function TableSection() {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInitializing, setIsInitializing] = useState(false);
  const { userData } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const tablesRef = collection(db, "tables");
    const q = query(tablesRef, orderBy("tableNumber", "asc"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedTables: Table[] = [];
      snapshot.forEach((doc) => {
        fetchedTables.push({ id: doc.id, ...doc.data() } as Table);
      });
      setTables(fetchedTables);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching tables:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleInitializeTables = async () => {
    setIsInitializing(true);
    try {
      const batch = writeBatch(db);
      TABLES_DATA.forEach((table) => {
        const tableRef = doc(db, "tables", table.id);
        batch.set(tableRef, {
          tableNumber: table.tableNumber,
          capacity: table.capacity,
          status: table.status,
          availabilityTime: table.availabilityTime || ""
        });
      });
      await batch.commit();
      toast({ title: "Mesas Inicializadas", description: "El sistema de mesas ha sido configurado correctamente." });
    } catch (error) {
      console.error("Error initializing tables:", error);
      toast({ title: "Error", description: "No se pudieron inicializar las mesas.", variant: "destructive" });
    } finally {
      setIsInitializing(false);
    }
  };

  const handleResetTables = async () => {
    setIsInitializing(true);
    try {
      const batch = writeBatch(db);
      tables.forEach((table) => {
        const tableRef = doc(db, "tables", table.id);
        batch.update(tableRef, {
          status: 'available',
          availabilityTime: ""
        });
      });
      await batch.commit();
      toast({ title: "Mesas Liberadas", description: "Todas las mesas vuelven a estar disponibles." });
    } catch (error) {
      console.error("Error resetting tables:", error);
      toast({ title: "Error", description: "No se pudieron resetear las mesas.", variant: "destructive" });
    } finally {
      setIsInitializing(false);
    }
  };

  return (
    <section id="tables" className="py-16 lg:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-lora font-bold text-primary mb-4">Reserva tu Mesa</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Encuentra el lugar perfecto para tu experiencia en Napoli Bites. Las mesas se reservan en tiempo real al finalizar tu pedido.
          </p>
          
          {userData?.isAdmin && tables.length > 0 && (
             <div className="mt-6 flex justify-center gap-4">
                <Button variant="outline" size="sm" onClick={handleResetTables} disabled={isInitializing}>
                  {isInitializing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCcw className="mr-2 h-4 w-4" />}
                  Liberar todas las mesas (Admin)
                </Button>
             </div>
          )}
        </div>
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Sincronizando estado de mesas...</p>
          </div>
        ) : tables.length === 0 ? (
          <div className="text-center py-20 bg-muted/20 rounded-xl border-2 border-dashed">
            <Database className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-bold mb-2">No hay mesas configuradas</h3>
            <p className="text-muted-foreground mb-6">Parece que es la primera vez que inicias el sistema.</p>
            <Button onClick={handleInitializeTables} disabled={isInitializing}>
              {isInitializing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Configurar Mesas Iniciales
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {tables.map((table) => (
              <TableCard key={table.id} table={table} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
