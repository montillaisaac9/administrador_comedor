'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Image from 'next/image';
import Link from 'next/link';
import { useAuthStore } from '@/context/AuthContext';
import { Form, InputField, Button, Alert } from '@/components/Forms';

// Validation schema
const loginSchema = z.object({
  email: z.string()
    .email('Ingresa un email válido')
    .min(1, 'El email es requerido'),
  password: z.string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .max(100)
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();
  const { login, isLoading, error } = useAuthStore();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data.email, data.password);
      // Navigation will be handled by the middleware based on the auth cookie
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al iniciar sesión');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="w-full max-w-md">
        {/* Logo y cabecera */}
        <div className="mb-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-primary-foreground" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6 3a1 1 0 011-1h.01a1 1 0 010 2H7a1 1 0 01-1-1zm2 3a1 1 0 00-2 0v1a2 2 0 00-2 2v1a2 2 0 002 2h6a2 2 0 002-2v-1a2 2 0 00-2-2V6a1 1 0 10-2 0v1H8V6zm10 8a2 2 0 01-2 2H4a2 2 0 01-2-2v-1h16v1z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Administrador de Comedor</h1>
          <p className="mt-2 text-muted-foreground">Inicia sesión para acceder al sistema</p>
        </div>
        
        {/* Tarjeta de login */}
        <div className="bg-card rounded-lg shadow-lg overflow-hidden">
          {/* Alerta de error */}
          {(errorMessage || error) && (
            <div className="p-4 bg-destructive/10 border-l-4 border-destructive">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-destructive" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-destructive">{errorMessage || error || ''}</p>
                </div>
                <div className="ml-auto pl-3">
                  <div className="-mx-1.5 -my-1.5">
                    <button
                      onClick={() => setErrorMessage(null)}
                      className="inline-flex rounded-md p-1.5 text-destructive hover:bg-destructive/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-destructive/10 focus:ring-destructive"
                    >
                      <span className="sr-only">Dismiss</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Formulario */}
          <div className="p-6">
            <Form<LoginFormData>
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-6"
            >
              <InputField
                name="email"
                label="Correo electrónico"
                control={control}
                type="email"
                placeholder="tu@correo.com"
                required
                error={errors.email?.message}
                autoComplete="email"
              />
              
              <InputField
                name="password"
                label="Contraseña"
                control={control}
                type="password"
                placeholder="••••••••"
                required
                error={errors.password?.message}
                autoComplete="current-password"
              />
              
              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <Link 
                    href="/forgot-password" 
                    className="text-primary hover:text-primary/90 underline-offset-4 hover:underline"
                  >
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
              </div>
              
              <Button
                type="submit"
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                isLoading={isLoading}
              >
                Iniciar sesión
              </Button>
            </Form>
          </div>
        </div>
        
        {/* Footer */}
        <p className="mt-8 text-center text-sm text-muted-foreground">
          Sistema Administrador de Comedor Universitario
        </p>
      </div>
    </div>
  );
}