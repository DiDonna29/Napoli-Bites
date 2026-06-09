
"use client";

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase/config';
import { collection, onSnapshot, query, orderBy, setDoc, doc, getDocs } from 'firebase/firestore';
import { TABLES_DATA } from '@/constants/tables';
import { TableCard } from '@/components/cards/TableCard';
import type { Table } from '@/types';
import { Loader2 } from 'lucide-react';

export function TableSection() {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const tablesRef = collection(db, "tables");
    
    // Función para inicializar mesas si no existen
    const seedTablesIfEmpty = async () => {
      const snapshot = await getDocs(tablesRef);
      if (snapshot.empty) {
        console.log("Seeding tables to Firestore...");
        for (const table of TABLES_DATA) {
          await setDoc(doc(db, "tables", table.id), table);
        }
      }
    };

    seedTablesIfEmpty();

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

  return (
    <section id="tables" className="py-16 lg:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-lora font-bold text-primary mb-4">Reserva tu Mesa</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Encuentra el lugar perfecto para tu experiencia en Napoli Bites. Las mesas se reservan por un máximo de 2 horas.
          </p>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
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
