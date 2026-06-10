
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { LogIn, Home, Copy, AlertTriangle } from "lucide-react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter, useSearchParams } from "next/navigation";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth, db } from "@/lib/firebase/config";
import { useToast } from "@/hooks/use-toast";
import { doc, setDoc, getDoc } from "firebase/firestore";
import type { UserProfile } from "@/types";
import { Suspense, useState, useEffect } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const loginSchema = z.object({
  email: z.string().email({ message: "Email no válido" }),
  password: z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres" }),
});

type LoginFormInputs = z.infer<typeof loginSchema>;

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [unauthorizedDomain, setUnauthorizedDomain] = useState<string | null>(null);
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
  });

  const redirectUrl = searchParams.get('redirect') || '/';

  const handleEmailLogin: SubmitHandler<LoginFormInputs> = async (data) => {
    setUnauthorizedDomain(null);
    try {
      await signInWithEmailAndPassword(auth, data.email, data.password);
      toast({ title: "Inicio de sesión exitoso", description: "¡Bienvenido de nuevo!" });
      router.push(redirectUrl);
    } catch (error: any) {
      toast({
        title: "Error al iniciar sesión",
        description: error.message || "Ocurrió un error inesperado.",
        variant: "destructive",
      });
    }
  };

  const handleGoogleLogin = async () => {
    setUnauthorizedDomain(null);
    const hostname = typeof window !== "undefined" ? window.location.hostname : "";
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

      toast({ title: "Inicio de sesión exitoso", description: `¡Hola, ${user.displayName}!` });
      router.push(redirectUrl);
    } catch (error: any) {
      console.error("Login Error Code:", error.code);
      if (error.code === 'auth/unauthorized-domain') {
        setUnauthorizedDomain(hostname);
      } else if (error.code === 'auth/popup-closed-by-user') {
        toast({
          title: "Ventana Cerrada",
          description: "La ventana de Google se cerró. Esto suele pasar si el dominio no está autorizado o si tienes un bloqueador de popups.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error de Google",
          description: error.message || "No se pudo iniciar sesión con Google.",
          variant: "destructive",
        });
      }
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copiado", description: "Dominio copiado al portapapeles." });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background to-secondary/30 p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center space-y-1">
          <CardTitle className="text-3xl font-lora text-primary">¡Bienvenido!</CardTitle>
          <CardDescription>Inicia sesión en Napoli Bites.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {unauthorizedDomain && (
            <Alert variant="destructive" className="bg-destructive/10 border-destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle className="font-bold">Dominio No Autorizado</AlertTitle>
              <AlertDescription className="space-y-3">
                <p className="text-xs">Para habilitar el acceso desde esta ventana, añade este dominio en tu Consola de Firebase:</p>
                <div className="flex items-center gap-2 bg-background p-2 rounded border border-destructive/20">
                  <code className="text-[10px] break-all flex-grow font-mono">{unauthorizedDomain}</code>
                  <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => copyToClipboard(unauthorizedDomain)}>
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
                <p className="text-[10px] font-semibold">Ruta: Authentication > Settings > Authorized domains</p>
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit(handleEmailLogin)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input id="email" type="email" placeholder="tu@ejemplo.com" {...register("email")} />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                 <Label htmlFor="password">Contraseña</Label>
                 <Link href="#" className="text-xs text-primary hover:underline">¿Olvidaste tu contraseña?</Link>
              </div>
              <Input id="password" type="password" placeholder="••••••••" {...register("password")} />
              {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
            </div>
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isSubmitting}>
              {isSubmitting ? "Iniciando..." : <><LogIn className="mr-2 h-4 w-4" /> Entrar</>}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground font-medium">o continúa con</span>
            </div>
          </div>
          
          <Button variant="outline" className="w-full h-12 text-md" type="button" onClick={handleGoogleLogin} disabled={isSubmitting}>
            <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Google
          </Button>
        </CardContent>
        <CardFooter className="flex-col items-center text-sm space-y-4 pt-0 pb-8">
          <div className="text-muted-foreground">
            ¿No tienes cuenta?{' '}
            <Link href="/register" className="text-primary hover:underline font-bold">Regístrate</Link>
          </div>
          <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-primary">
            <Link href="/"><Home className="mr-1 h-4 w-4" /> Volver al Inicio</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Cargando...</div>}>
      <LoginForm />
    </Suspense>
  );
}
