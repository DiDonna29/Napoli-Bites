import type {Metadata} from 'next';
import { Inter, Lora } from 'next/font/google'; // Replaced Geist_Sans with Inter
import './globals.css';
import { Toaster } from "@/components/ui/toaster";

// Instantiate Inter and assign its variable name to --font-geist-sans
// This keeps globals.css compatible as it references --font-geist-sans.
const sansFont = Inter({
  variable: '--font-geist-sans', // CSS variable for the sans-serif font
  subsets: ['latin'],
});

const loraFont = Lora({
  variable: '--font-lora', // CSS variable for the serif font
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
        {children}
        <Toaster />
      </body>
    </html>
  );
}
