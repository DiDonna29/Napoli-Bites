
import { HeroSection } from '@/components/sections/HeroSection';
import { PizzaMenuSection } from '@/components/sections/PizzaMenuSection';
import { DrinksMenuSection } from '@/components/sections/DrinksMenuSection';
import { DessertsMenuSection } from '@/components/sections/DessertsMenuSection';
import { TableSection } from '@/components/sections/TableSection';
import { PromotionsSection } from '@/components/sections/PromotionsSection';

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <PromotionsSection />
      <PizzaMenuSection />
      <DessertsMenuSection />
      <DrinksMenuSection />
      <TableSection />
    </>
  );
}
