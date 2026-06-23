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
import { useCart } from '@/hooks/useCart';

export function Header() {
  const { user, userData, loading } = useAuth();
  const { t } = useTranslation();
  const { getCartItemCount } = useCart();
  const router = useRouter();
  const { toast } = useToast();

  const cartCount = getCartItemCount();

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
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2 group">
          <div className="bg-primary rounded-full p-1.5 transition-transform group-hover:rotate-12">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className="h-5 w-5 fill-white">
              <text x="50" y="70" fontSize="60" textAnchor="middle" fontWeight="900">N</text>
            </svg>
          </div>
          <span className="font-lora text-xl font-bold tracking-tight text-primary hidden sm:inline-block">Napoli Bites</span>
        </Link>

        <nav className="hidden md:flex items-center space-x-8 text-sm font-medium">
          {navItems.map((item) => (
            <Link key={item.label} href={item.href} className="transition-colors hover:text-primary relative group">
              {item.label}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
            </Link>
          ))}
        </nav>

        <div className="flex items-center space-x-2 sm:space-x-4">
          <LanguageSwitcher />
          
          <Button variant="ghost" size="icon" asChild className="relative">
            <Link href="/cart" aria-label="Carrito">
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center animate-in zoom-in">
                  {cartCount}
                </span>
              )}
            </Link>
          </Button>
          
          {loading ? (
            <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full ring-2 ring-transparent hover:ring-primary/20 transition-all">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={userData?.photoURL || user.photoURL || undefined} alt="User" />
                    <AvatarFallback>{getInitials(userData?.displayName || user.displayName)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-bold leading-none truncate">{userData?.displayName || user.displayName || "Usuario"}</p>
                    <p className="text-xs leading-none text-muted-foreground truncate">{userData?.email || user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link href="/profile/orders">{t('nav.myOrders')}</Link>
                </DropdownMenuItem>
                {userData?.isAdmin && (
                  <DropdownMenuItem asChild className="cursor-pointer text-primary focus:text-primary">
                    <Link href="/admin/dashboard">
                      <ShieldCheck className="mr-2 h-4 w-4" />
                      {t('nav.admin')}
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  {t('nav.logout')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button size="sm" asChild className="hidden sm:inline-flex shadow-md">
              <Link href="/login">
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
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <nav className="flex flex-col space-y-6 mt-12">
                  {navItems.map((item) => (
                    <SheetClose asChild key={item.label}>
                      <Link href={item.href} className="text-xl font-lora font-bold hover:text-primary transition-colors">{item.label}</Link>
                    </SheetClose>
                  ))}
                  <Separator />
                  {user ? (
                    <>
                      <SheetClose asChild>
                        <Link href="/profile/orders" className="text-lg font-medium">{t('nav.myOrders')}</Link>
                      </SheetClose>
                      <Button variant="destructive" onClick={handleLogout} className="w-full">{t('nav.logout')}</Button>
                    </>
                  ) : (
                    <SheetClose asChild>
                      <Button asChild className="w-full py-6 text-lg">
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