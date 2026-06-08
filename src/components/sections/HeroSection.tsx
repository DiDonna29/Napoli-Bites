"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/context/LanguageContext';
import images from '@/app/lib/placeholder-images.json';

export function HeroSection() {
  const { t } = useTranslation();

  return (
    <section className="relative h-[calc(100vh-4rem)] min-h-[500px] flex items-center justify-center text-center text-white overflow-hidden">
      <Image
        src={images.hero.url}
        alt="Delicious Napoli Pizza"
        fill
        className="z-0 object-cover"
        priority
        data-ai-hint={images.hero.hint}
      />
      <div className="absolute inset-0 bg-black/60 z-10"></div>
      <div className="relative z-20 container mx-auto px-4">
        <h1 className="font-lora text-5xl md:text-7xl font-bold mb-6 leading-tight">
          {t('hero.title')}
        </h1>
        <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto opacity-90">
          {t('hero.subtitle')}
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground" asChild>
            <Link href="/#menu">{t('hero.explore')}</Link>
          </Button>
          <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10" asChild>
            <Link href="/#tables">{t('hero.reserve')}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
