import Link from 'next/link';
import { Facebook, Instagram, Twitter } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-secondary text-secondary-foreground py-12">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
        <div>
          <h3 className="text-xl font-lora font-semibold mb-4 text-primary">Napoli Bites</h3>
          <p className="text-sm">
            Delivering authentic Neapolitan pizza experience since 2023.
          </p>
        </div>
        <div>
          <h4 className="text-lg font-lora font-semibold mb-4">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/#menu" className="hover:text-primary">Menu</Link></li>
            <li><Link href="/#tables" className="hover:text-primary">Reserve a Table</Link></li>
            <li><Link href="/order" className="hover:text-primary">Order Online</Link></li>
            <li><Link href="/contact" className="hover:text-primary">Contact Us</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-lg font-lora font-semibold mb-4">Follow Us</h4>
          <div className="flex justify-center md:justify-start space-x-4">
            <Link href="#" aria-label="Facebook" className="hover:text-primary"><Facebook size={24} /></Link>
            <Link href="#" aria-label="Instagram" className="hover:text-primary"><Instagram size={24} /></Link>
            <Link href="#" aria-label="Twitter" className="hover:text-primary"><Twitter size={24} /></Link>
          </div>
        </div>
      </div>
      <div className="container mx-auto text-center mt-8 pt-8 border-t border-border">
        <p className="text-sm">
          &copy; {new Date().getFullYear()} Napoli Bites. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
