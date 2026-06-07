
// src/app/(auth)/register/page.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { UserPlus, Home } from "lucide-react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter, useSearchParams } from "next/navigation";
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, updateProfile } from "firebase/auth";
import { auth, db } from "@/lib/firebase/config";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import type { UserProfile } from "@/types";

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

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterFormInputs>({
    resolver: zodResolver(registerSchema),
  });

  const redirectUrl = searchParams.get('redirect') || '/';

  const handleEmailRegister: SubmitHandler<RegisterFormInputs> = async (data) => {
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
      console.error("Error en registro de email:", error);
      toast({
        title: "Error al registrarse",
        description: error.message || "Ocurrió un error inesperado.",
        variant: "destructive",
      });
    }
  };

  const handleGoogleRegister = async () => {
    const hostname = typeof window !== "undefined" ? window.location.hostname : "N/A";
    
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
        toast({ title: "Registro exitoso", description: `¡Bienvenido, ${user.displayName || 'Usuario'}!` });
      } else {
        toast({ title: "Inicio de sesión exitoso", description: `¡Hola de nuevo, ${user.displayName || 'Usuario'}!` });
      }
      
      router.push(redirectUrl);
    } catch (error: any) {
      console.error("Error en registro de Google:", error);
      
      if (error.code === 'auth/unauthorized-domain') {
        toast({
          title: "Dominio No Autorizado",
          description: `Debes añadir '${hostname}' a los 'Dominios autorizados' en tu Consola de Firebase > Authentication > pestaña 'Settings' o al final de 'Sign-in method'.`,
          variant: "destructive",
          duration: 20000,
        });
      } else {
        toast({
          title: "Error de Google",
          description: error.message || "No se pudo registrar con Google.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background to-secondary/30 p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center space-y-1">
          <CardTitle className="text-3xl font-lora text-primary">Crea una Cuenta</CardTitle>
          <CardDescription>Únete a Napoli Bites para una experiencia auténtica.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(handleEmailRegister)}>
          <CardContent className="space-y-6">
            <div className="space-y-4">
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
            </div>
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isSubmitting}>
              {isSubmitting ? "Registrando..." : <><UserPlus className="mr-2 h-4 w-4" /> Crear Cuenta</>}
            </Button>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">O regístrate con</span>
              </div>
            </div>
            <Button variant="outline" className="w-full" type="button" onClick={handleGoogleRegister} disabled={isSubmitting}>
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /><path d="M1 1h22v22H1z" fill="none" /></svg>
              Google
            </Button>
          </CardContent>
        </form>
        <CardFooter className="flex-col items-center text-sm space-y-2">
          <div>
            ¿Ya tienes cuenta?{' '}
             <Link href={`/login${redirectUrl !== '/' ? `?redirect=${encodeURIComponent(redirectUrl)}` : ''}`} className="text-primary hover:underline font-medium">
              Inicia Sesión
            </Link>
          </div>
           <Button variant="link" size="sm" asChild className="text-muted-foreground hover:text-primary">
            <Link href="/">
              <Home className="mr-1 h-3 w-3" /> Volver al Inicio
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
