
import type {Metadata} from 'next';
import { Inter, Lora } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/hooks/useCart';
import { LanguageProvider } from '@/context/LanguageContext';

const sansFont = Inter({
  variable: '--font-geist-sans', 
  subsets: ['latin'],
});

const loraFont = Lora({
  variable: '--font-lora', 
  subsets: ['latin'],
  weight: ['400', '700'],
});

export const metadata: Metadata = {
  title: 'Napoli Bites',
  description: 'Authentic Neapolitan Pizzeria',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${sansFont.variable} ${loraFont.variable} antialiased`}>
        <AuthProvider>
          <LanguageProvider>
            <CartProvider>
              {children}
              <Toaster />
            </CartProvider>
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
