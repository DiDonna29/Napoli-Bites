
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LanguageSwitcher } from './LanguageSwitcher';
import { ShoppingCart, UserCircle, Menu as MenuIcon, LogOut, ShieldCheck } from 'lucide-react';
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
import { useTranslation } from '@/context/LanguageContext';

export function Header() {
  const { user, userData, loading } = useAuth();
  const { t } = useTranslation();
  const router = useRouter();
  const { toast } = useToast();

  const navItems = [
    { href: '/#menu', label: t('nav.menu') },
    { href: '/#tables', label: t('nav.tables') },
    { href: '/order', label: t('nav.orderNow') },
  ];

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({ title: "Sesión Cerrada", description: "Has salido correctamente." });
      router.push('/'); 
    } catch (error) {
      console.error("Logout error:", error);
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
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className="h-8 w-8 text-primary">
            <circle cx="50" cy="50" r="45" fill="hsl(var(--primary))" />
            <text x="50" y="62" fontSize="30" fill="hsl(var(--primary-foreground))" textAnchor="middle" fontWeight="bold">NB</text>
          </svg>
          <span className="font-lora text-2xl font-bold text-primary">Napoli Bites</span>
        </Link>

        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          {navItems.map((item) => (
            <Link key={item.label} href={item.href} className="transition-colors hover:text-primary">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center space-x-3">
          <LanguageSwitcher />
          <Button variant="ghost" size="icon" asChild>
            <Link href="/cart" aria-label="Carrito">
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
                    <AvatarImage src={userData?.photoURL || user.photoURL || undefined} alt="User" />
                    <AvatarFallback>{getInitials(userData?.displayName || user.displayName)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{userData?.displayName || user.displayName || "Usuario"}</p>
                    <p className="text-xs leading-none text-muted-foreground">{userData?.email || user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile/orders">{t('nav.myOrders')}</Link>
                </DropdownMenuItem>
                {userData?.isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin/dashboard">
                      <ShieldCheck className="mr-2 h-4 w-4" />
                      {t('nav.admin')}
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  {t('nav.logout')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="outline" size="sm" asChild className="hidden sm:inline-flex">
              <Link href="/login">
                <UserCircle className="mr-2 h-4 w-4" />
                {t('nav.login')}
              </Link>
            </Button>
          )}
          
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MenuIcon className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <nav className="flex flex-col space-y-4 mt-8">
                  {navItems.map((item) => (
                    <SheetClose asChild key={item.label}>
                      <Link href={item.href} className="text-lg">{item.label}</Link>
                    </SheetClose>
                  ))}
                  <Separator />
                  {user ? (
                    <>
                      <SheetClose asChild>
                        <Link href="/profile/orders" className="text-lg">{t('nav.myOrders')}</Link>
                      </SheetClose>
                      <Button variant="outline" onClick={handleLogout}>{t('nav.logout')}</Button>
                    </>
                  ) : (
                    <SheetClose asChild>
                      <Button variant="outline" asChild>
                        <Link href="/login">{t('nav.login')}</Link>
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
