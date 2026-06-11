
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { UserPlus, Home, Copy, AlertTriangle, RefreshCcw, Info, ExternalLink } from "lucide-react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter, useSearchParams } from "next/navigation";
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, signInWithRedirect, updateProfile } from "firebase/auth";
import { auth, db } from "@/lib/firebase/config";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import type { UserProfile } from "@/types";
import { useState, Suspense } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const registerSchema = z.object({
  fullName: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres" }),
  email: z.string().email({ message: "Email no válido" }),
  password: z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres" }),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

type RegisterFormInputs = z.infer<typeof registerSchema>;

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [unauthorizedDomain, setUnauthorizedDomain] = useState<string | null>(null);
  const [showTroubleshooting, setShowTroubleshooting] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterFormInputs>({
    resolver: zodResolver(registerSchema),
  });

  const redirectUrl = searchParams.get('redirect') || '/';

  const handleEmailRegister: SubmitHandler<RegisterFormInputs> = async (data) => {
    setUnauthorizedDomain(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: data.fullName });

      const newUserProfile: UserProfile = {
        uid: user.uid,
        email: user.email,
        displayName: data.fullName,
        photoURL: user.photoURL,
        createdAt: Date.now(),
        isAdmin: false,
      };
      await setDoc(doc(db, "users", user.uid), newUserProfile);

      toast({ title: "Registro exitoso", description: "¡Bienvenido a Napoli Bites!" });
      router.push(redirectUrl);
    } catch (error: any) {
      toast({
        title: "Error al registrarse",
        description: error.message || "Ocurrió un error inesperado.",
        variant: "destructive",
      });
    }
  };

  const handleGoogleRegister = async () => {
    setUnauthorizedDomain(null);
    const hostname = typeof window !== "undefined" ? window.location.hostname : "";
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    
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
        toast({ title: "Registro exitoso", description: `¡Bienvenido, ${user.displayName || 'Usuario'}!` });
      } else {
        toast({ title: "Inicio de sesión exitoso", description: `¡Hola de nuevo, ${user.displayName || 'Usuario'}!` });
      }
      
      router.push(redirectUrl);
    } catch (error: any) {
      console.error("Auth Error Code:", error.code);
      setShowTroubleshooting(true);
      setUnauthorizedDomain(hostname);
      
      toast({
        title: "Problema de Ventana",
        description: "Intentando redirección para evitar bloqueos...",
      });

      try {
        await signInWithRedirect(auth, provider);
      } catch (redirectError) {
        console.error("Redirect failed:", redirectError);
      }
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copiado", description: "Dominio copiado." });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background to-secondary/30 p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center space-y-1">
          <CardTitle className="text-3xl font-lora text-primary">Crea una Cuenta</CardTitle>
          <CardDescription>Únete a Napoli Bites para una experiencia auténtica.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {showTroubleshooting && (
            <Alert variant="destructive" className="bg-destructive/5 border-destructive/20 animate-in fade-in duration-500">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle className="text-sm font-bold">Guía de Configuración</AlertTitle>
              <AlertDescription className="text-[10px] space-y-2 mt-2">
                <p>1. <strong>Autorizar Dominio:</strong> Verifica que este dominio exacto esté en Firebase (no soporta wildcards *):</p>
                <div className="flex items-center gap-2 bg-background p-2 rounded border my-1">
                  <code className="truncate flex-grow text-[9px]">{unauthorizedDomain || window.location.hostname}</code>
                  <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => copyToClipboard(unauthorizedDomain || window.location.hostname)}>
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
                <p>2. <strong>Cookies:</strong> Asegúrate de permitir <strong>"Cookies de terceros"</strong> en la configuración de privacidad del navegador.</p>
              </AlertDescription>
            </Alert>
          )}

          <div className="bg-amber-50 dark:bg-amber-950/40 p-3 rounded-md border border-amber-200 dark:border-amber-800 flex gap-3">
             <Info className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
             <div className="text-[10px] text-amber-700 dark:text-amber-300 space-y-1">
                <p className="font-bold">Nota de Seguridad:</p>
                <p>Si usas <strong>Incógnito</strong>, entra primero a <Link href="https://console.cloud.google.com" target="_blank" className="underline font-bold">Cloud Console</Link> en otra pestaña para desbloquear el error 401.</p>
             </div>
          </div>

          <form onSubmit={handleSubmit(handleEmailRegister)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Nombre Completo</Label>
              <Input id="fullName" type="text" placeholder="Juan Pérez" {...register("fullName")} />
              {errors.fullName && <p className="text-xs text-destructive">{errors.fullName.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input id="email" type="email" placeholder="tu@ejemplo.com" {...register("email")} />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input id="password" type="password" placeholder="••••••••" {...register("password")} />
              {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
              <Input id="confirmPassword" type="password" placeholder="••••••••" {...register("confirmPassword")} />
              {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>}
            </div>
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isSubmitting}>
              {isSubmitting ? "Registrando..." : <><UserPlus className="mr-2 h-4 w-4" /> Crear Cuenta</>}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground font-medium">o regístrate con</span>
            </div>
          </div>
          
          <Button variant="outline" className="w-full h-12 text-md" type="button" onClick={handleGoogleRegister} disabled={isSubmitting}>
            <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Google
          </Button>
        </CardContent>
        <CardFooter className="flex-col items-center text-sm space-y-4 pt-0 pb-8">
          <div className="text-muted-foreground">
            ¿Ya tienes cuenta?{' '}
             <Link href={`/login${redirectUrl !== '/' ? `?redirect=${encodeURIComponent(redirectUrl)}` : ''}`} className="text-primary hover:underline font-bold">
              Inicia Sesión
            </Link>
          </div>
           <div className="flex gap-2">
            <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-primary">
              <Link href="/"><Home className="mr-1 h-4 w-4" /> Inicio</Link>
            </Button>
            <Button variant="ghost" size="sm" onClick={() => window.location.reload()} className="text-muted-foreground">
              <RefreshCcw className="mr-1 h-3 w-3" /> Refrescar
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Cargando...</div>}>
      <RegisterForm />
    </Suspense>
  );
}
