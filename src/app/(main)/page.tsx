import { HeroSection } from '@/components/sections/HeroSection';
import { PizzaMenuSection } from '@/components/sections/PizzaMenuSection';
import { DrinksMenuSection } from '@/components/sections/DrinksMenuSection';
import { TableSection } from '@/components/sections/TableSection';
import { PromotionsSection } from '@/components/sections/PromotionsSection';

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <PromotionsSection />
      <PizzaMenuSection />
      <DrinksMenuSection />
      <TableSection />
      {/* This structure simulates an "infinite scroll" feel by having multiple sections on one page.
          Actual infinite loading would require more complex logic for fetching data in chunks. */}
    </>
  );
}
