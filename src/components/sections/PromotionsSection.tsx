import Image from 'next/image';
import Link from 'next/link';
import type { Promotion } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { TicketPercent } from 'lucide-react';
import images from '@/app/lib/placeholder-images.json';

const PROMOTIONS_DATA: Promotion[] = [
  {
    id: 'promo-1',
    title: 'Family Feast Deal',
    description: 'Get 2 Large Pizzas, 4 Drinks, and a side of Garlic Knots for just $39.99!',
    imageUrl: images.promo_family.url,
    imageHint: images.promo_family.hint,
  },
  {
    id: 'promo-2',
    title: 'Midweek Madness',
    description: 'Enjoy 20% off any pizza every Wednesday. Dine-in or Takeaway.',
    imageUrl: images.promo_discount.url,
    imageHint: images.promo_discount.hint,
  },
   {
    id: 'promo-3',
    title: 'Lunch Special',
    description: 'Any Small Pizza + Soft Drink for $10. Weekdays 12 PM - 3 PM.',
    imageUrl: images.promo_lunch.url,
    imageHint: images.promo_lunch.hint,
  },
];

export function PromotionsSection() {
  return (
    <section id="promotions" className="py-16 lg:py-24 bg-secondary">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-lora font-bold text-primary mb-4">Special Offers</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Don't miss out on our delicious deals and promotions!
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {PROMOTIONS_DATA.map((promo) => (
            <Card key={promo.id} className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="p-0">
                <div className="aspect-[16/9] relative">
                  <Image
                    src={promo.imageUrl}
                    alt={promo.title}
                    layout="fill"
                    objectFit="cover"
                    data-ai-hint={promo.imageHint || "food promotion"}
                  />
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <CardTitle className="text-xl font-lora mb-2">{promo.title}</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  {promo.description}
                </CardDescription>
              </CardContent>
              <CardFooter className="p-6 pt-0">
                <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" asChild>
                  <Link href="/order">
                    <TicketPercent className="mr-2 h-4 w-4" />
                    View Deal
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
