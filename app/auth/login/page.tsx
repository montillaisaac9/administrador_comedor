// app/login/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { login } from '@/app/service/auth.service';
// Error types will be handled with type guards
import useUserStore from '@/app/stores/useUserStore';

// Define schema for form validation
const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'El email es requerido' })
    .email({ message: 'Introduce un email válido' }),
  password: z
    .string()
    .min(1, { message: 'La contraseña es requerida' })
});

// TypeScript type for our form data
type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState<{message: string; type: 'error' | 'success'} | null>(null);
  const router = useRouter();
  const setUser = useUserStore((state) => state.setUser);
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  // Clear error when form values change
  useEffect(() => {
    const subscription = watch(() => {
      if (apiError) {
        setApiError(null);
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, apiError]);

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const onSubmit = async (data: LoginFormData) => {
    setApiError(null);
    try {
      const response = await login(data);
      
      // Si llegamos aquí, el login fue exitoso
      if (response.data) {
        setUser(response.data);
        router.push('/dashboard/statistics');
      } else {
        throw new Error('No se recibieron datos de usuario');
      }
    } catch (err) {
      console.error('Error en el inicio de sesión:', err);
      
      // Type guard to check if it's an Axios error
      interface AxiosErrorResponse {
        response?: {
          data?: {
            error?: {
              message?: string;
            };
          };
        };
      }
      
      const isAxiosError = (error: unknown): error is AxiosErrorResponse => {
        return typeof error === 'object' && error !== null && 'response' in error;
      };

      if (isAxiosError(err)) {
        const errorMessage = err.response?.data?.error?.message || 'Error en la autenticación';
        setApiError({
          message: errorMessage,
          type: 'error'
        });
      } else if (err instanceof Error) {
        setApiError({
          message: err.message || 'Ocurrió un error inesperado',
          type: 'error'
        });
      } else {
        setApiError({
          message: 'No se pudo conectar al servidor. Verifica tu conexión e inténtalo de nuevo.',
          type: 'error'
        });
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="flex justify-center mb-4">
          <Image 
            src="/logo_n.png" 
            alt="Logo" 
            width={80}
            height={80}
            className="h-20 w-auto"
            priority
          />
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Iniciar Sesión</h2>
          <p className="mt-2 text-sm text-gray-600">Accede a tu cuenta para continuar</p>
        </div>

        {apiError && (
          <div className={`p-4 rounded-md ${
            apiError.type === 'error' ? 'bg-red-50' : 'bg-green-50'
          }`}>
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className={`h-5 w-5 ${
                  apiError.type === 'error' ? 'text-red-400' : 'text-green-400'
                }`} aria-hidden="true" />
              </div>
              <div className="ml-3">
                <p className={`text-sm font-medium ${
                  apiError.type === 'error' ? 'text-red-800' : 'text-green-800'
                }`}>
                  {apiError.message}
                </p>
              </div>
            </div>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <div className="mt-1">
              <input
                id="email"
                {...register('email')}
                type="email"
                autoComplete="email"
                className={`w-full px-3 py-2 text-black border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Contraseña
            </label>
            <div className="relative mt-1">
              <input
                id="password"
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                className={`w-full px-3 py-2 pr-10 text-black border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.password ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" aria-hidden="true" />
                ) : (
                  <Eye className="w-5 h-5" aria-hidden="true" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
            )}
            <div className="mt-2 flex justify-between items-center">
              <div className="text-sm">
                <Link
                  href="/auth/register"
                  className="text-blue-600 hover:underline"
                >
                  ¿No tienes cuenta? Regístrate
                </Link>
              </div>
              <div className="text-sm">
                <Link
                  href="/auth/reset-password"
                  className="text-blue-600 hover:underline"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Cargando...' : 'Ingresar'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
