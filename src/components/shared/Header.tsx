
// src/components/shared/Header.tsx
"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { LanguageSwitcher } from './LanguageSwitcher';
import { ShoppingCart, UserCircle, Menu as MenuIcon, LogOut, ShieldCheck } from 'lucide-react'; // Added ShieldCheck
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from '@/hooks/useAuth';
import { auth } from '@/lib/firebase/config';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Separator } from "@/components/ui/separator";

export function Header() {
  const { user, userData, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const navItems = [
    { href: '/#menu', label: 'Menu' },
    { href: '/#tables', label: 'Tables' },
    { href: '/order', label: 'Order Now' },
  ];

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({ title: "Logged Out", description: "You have been successfully logged out." });
      router.push('/'); 
    } catch (error) {
      console.error("Logout error:", error);
      toast({ title: "Logout Failed", description: "Could not log out. Please try again.", variant: "destructive" });
    }
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          {/* Using a simple SVG logo placeholder */}
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className="h-8 w-8 text-primary">
            <circle cx="50" cy="50" r="45" fill="hsl(var(--primary))" />
            <text x="50" y="62" fontSize="30" fill="hsl(var(--primary-foreground))" textAnchor="middle" fontWeight="bold">NB</text>
          </svg>
          <span className="font-lora text-2xl font-bold text-primary">Napoli Bites</span>
        </Link>

        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="transition-colors hover:text-primary"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center space-x-3">
          <LanguageSwitcher />
          <Button variant="ghost" size="icon" asChild>
            <Link href="/cart" aria-label="Shopping Cart">
              <ShoppingCart className="h-5 w-5" />
            </Link>
          </Button>
          
          {loading ? (
            <UserCircle className="h-6 w-6 text-muted-foreground animate-pulse" />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={userData?.photoURL || user.photoURL || undefined} alt={userData?.displayName || user.displayName || "User"} />
                    <AvatarFallback>{getInitials(userData?.displayName || user.displayName)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{userData?.displayName || user.displayName || "User"}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {userData?.email || user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile/orders">My Orders</Link>
                </DropdownMenuItem>
                {userData?.isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin/dashboard">
                      <ShieldCheck className="mr-2 h-4 w-4" />
                      Admin Dashboard
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="outline" size="sm" asChild className="hidden sm:inline-flex">
              <Link href="/login">
                <UserCircle className="mr-2 h-4 w-4" />
                Login
              </Link>
            </Button>
          )}
          
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MenuIcon className="h-6 w-6" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <nav className="flex flex-col space-y-4 mt-8">
                  {navItems.map((item) => (
                     <SheetClose asChild key={item.label}>
                        <Link
                        href={item.href}
                        className="text-lg transition-colors hover:text-primary"
                        >
                        {item.label}
                        </Link>
                    </SheetClose>
                  ))}
                  <Separator className="my-2" />
                  {loading ? (
                     <p className="text-muted-foreground">Loading user...</p>
                  ) : user ? (
                    <>
                      <SheetClose asChild>
                        <Link href="/profile/orders" className="text-lg transition-colors hover:text-primary">My Orders</Link>
                      </SheetClose>
                      {userData?.isAdmin && (
                        <SheetClose asChild>
                           <Link href="/admin/dashboard" className="text-lg transition-colors hover:text-primary flex items-center">
                             <ShieldCheck className="mr-2 h-5 w-5" /> Admin
                           </Link>
                        </SheetClose>
                      )}
                       <Button variant="outline" onClick={() => { handleLogout(); const closeButton = document.querySelector('#radix-\\:R1csrrq\\: > button'); if (closeButton instanceof HTMLElement) closeButton.click(); }} > {/* Added SheetClose equivalent for mobile */}
                        <LogOut className="mr-2 h-5 w-5" />
                        Logout
                      </Button>
                    </>
                  ) : (
                    <SheetClose asChild>
                        <Button variant="outline" asChild>
                            <Link href="/login">
                            <UserCircle className="mr-2 h-5 w-5" />
                            Login / Register
                            </Link>
                        </Button>
                    </SheetClose>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
