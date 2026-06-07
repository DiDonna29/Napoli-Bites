
// src/app/(auth)/login/page.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { LogIn, Home } from "lucide-react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter, useSearchParams } from "next/navigation";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth, db } from "@/lib/firebase/config";
import { useToast } from "@/hooks/use-toast";
import { doc, setDoc, getDoc } from "firebase/firestore";
import type { UserProfile } from "@/types";

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

type LoginFormInputs = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
  });

  const redirectUrl = searchParams.get('redirect') || '/';

  const handleEmailLogin: SubmitHandler<LoginFormInputs> = async (data) => {
    try {
      await signInWithEmailAndPassword(auth, data.email, data.password);
      toast({ title: "Login Successful", description: "Welcome back!" });
      router.push(redirectUrl);
    } catch (error: any) {
      console.error("Email login error:", error);
      toast({
        title: "Login Failed",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  const handleGoogleLogin = async () => {
    const currentOrigin = typeof window !== "undefined" ? window.location.origin : "N/A";
    const hostname = typeof window !== "undefined" ? window.location.hostname : "N/A";
    const firebaseAuthDomain = auth.app.options.authDomain || "NOT_CONFIGURED";
    
    // Diagnostic log in the browser console
    console.log("--- GOOGLE LOGIN DIAGNOSTICS ---");
    console.log("1. Application Domain (Origin):", currentOrigin);
    console.log("2. Hostname (to add in Firebase):", hostname);
    console.log("3. Configured Auth Domain in .env.local:", firebaseAuthDomain);

    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (!userDocSnap.exists()) {
        const newUserProfile: UserProfile = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          createdAt: Date.now(),
          isAdmin: false,
        };
        await setDoc(userDocRef, newUserProfile);
      }

      toast({ title: "Login Successful", description: `Welcome, ${user.displayName || 'User'}!` });
      router.push(redirectUrl);
    } catch (error: any) {
      console.error("Google login error:", error);
      
      if (error.code === 'auth/unauthorized-domain') {
        toast({
          title: "Error: Dominio No Autorizado",
          description: `Debes añadir '${hostname}' a los 'Dominios autorizados' en tu Consola de Firebase > Authentication > Sign-in method.`,
          variant: "destructive",
          duration: 15000,
        });
      } else {
        toast({
          title: "Login Failed",
          description: error.message || "Could not sign in with Google.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background to-secondary/30 p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center space-y-1">
          <CardTitle className="text-3xl font-lora text-primary">Welcome Back!</CardTitle>
          <CardDescription>Log in to Napoli Bites to continue.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(handleEmailLogin)}>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="you@example.com" {...register("email")} />
                {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link href="#" className="text-xs text-primary hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <Input id="password" type="password" placeholder="••••••••" {...register("password")} />
                {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
              </div>
            </div>
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isSubmitting}>
              {isSubmitting ? "Logging in..." : <><LogIn className="mr-2 h-4 w-4" /> Log In</>}
            </Button>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>
            <Button variant="outline" className="w-full" type="button" onClick={handleGoogleLogin} disabled={isSubmitting}>
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /><path d="M1 1h22v22H1z" fill="none" /></svg>
              Log in with Google
            </Button>
          </CardContent>
        </form>
        <CardFooter className="flex-col items-center text-sm space-y-2">
          <div>
            Don&apos;t have an account?{' '}
            <Link href={`/register${redirectUrl !== '/' ? `?redirect=${encodeURIComponent(redirectUrl)}` : ''}`} className="text-primary hover:underline font-medium">
              Sign Up
            </Link>
          </div>
          <Button variant="link" size="sm" asChild className="text-muted-foreground hover:text-primary">
            <Link href="/">
              <Home className="mr-1 h-3 w-3" /> Return to Homepage
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
