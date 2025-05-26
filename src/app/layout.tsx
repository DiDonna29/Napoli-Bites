
import type {Metadata} from 'next';
import { Inter, Lora } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from '@/context/AuthContext'; // Import AuthProvider
import { CartProvider } from '@/hooks/useCart'; // Import CartProvider

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
        <AuthProvider> {/* Wrap children with AuthProvider */}
          <CartProvider> {/* Wrap with CartProvider */}
            {children}
            <Toaster />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
