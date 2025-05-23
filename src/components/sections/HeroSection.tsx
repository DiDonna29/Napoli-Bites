import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function HeroSection() {
  return (
    <section className="relative h-[calc(100vh-4rem)] min-h-[500px] flex items-center justify-center text-center text-white overflow-hidden">
      <Image
        src="https://placehold.co/1920x1080.png"
        alt="Delicious Napoli Pizza"
        layout="fill"
        objectFit="cover"
        quality={80}
        className="z-0"
        data-ai-hint="pizzeria ambiance"
      />
      <div className="absolute inset-0 bg-black/60 z-10"></div>
      <div className="relative z-20 container mx-auto px-4">
        <h1 className="font-lora text-5xl md:text-7xl font-bold mb-6 leading-tight">
          Taste the Heart of Naples
        </h1>
        <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto">
          Experience authentic Neapolitan pizza, crafted with love and the finest Italian ingredients.
        </p>
        <div className="space-x-4">
          <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground" asChild>
            <Link href="/#menu">Explore Menu</Link>
          </Button>
          <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10" asChild>
            <Link href="/#tables">Reserve a Table</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
