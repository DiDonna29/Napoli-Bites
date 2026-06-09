
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
import { Suspense } from "react";

const loginSchema = z.object({
  email: z.string().email({ message: "Email no válido" }),
  password: z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres" }),
});

type LoginFormInputs = z.infer<typeof loginSchema>;

function LoginForm() {
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
      if (error.code === 'auth/popup-closed-by-user') {
        toast({
          title: "Ventana Cerrada",
          description: "La ventana de inicio de sesión se cerró antes de completar el proceso. Por favor, asegúrate de permitir popups en tu navegador e intenta de nuevo.",
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

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background to-secondary/30 p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center space-y-1">
          <CardTitle className="text-3xl font-lora text-primary">¡Bienvenido!</CardTitle>
          <CardDescription>Inicia sesión en Napoli Bites.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(handleEmailLogin)}>
          <CardContent className="space-y-6">
            <div className="space-y-4">
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
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Iniciando..." : <><LogIn className="mr-2 h-4 w-4" /> Entrar</>}
            </Button>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">O continúa con</span>
              </div>
            </div>
            <Button variant="outline" className="w-full" type="button" onClick={handleGoogleLogin} disabled={isSubmitting}>
              Google
            </Button>
          </CardContent>
        </form>
        <CardFooter className="flex-col items-center text-sm space-y-2">
          <div>
            ¿No tienes cuenta?{' '}
            <Link href="/register" className="text-primary hover:underline font-medium">Regístrate</Link>
          </div>
          <Button variant="link" size="sm" asChild>
            <Link href="/"><Home className="mr-1 h-3 w-3" /> Volver al Inicio</Link>
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
