'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { changePassword } from '@/app/service/auth.service';
import type { IResponse } from '@/app/types/response';

// Define schema for form validation
const resetPasswordSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'El email es requerido' })
    .email({ message: 'Introduce un email válido' }),
  securityWord: z
    .string()
    .min(1, { message: 'La palabra de seguridad es requerida' }),
  newPassword: z
    .string()
    .min(1, { message: 'La contraseña es requerida' }),
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const [showPassword, setShowPassword] = useState({
    newPassword: false,
    confirmPassword: false,
    securityWord: false
  });
  const [isSuccess, setIsSuccess] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { 
      email: '',
      securityWord: '',
      newPassword: '',
      confirmPassword: '' 
    },
  });

  const togglePasswordVisibility = (field: keyof typeof showPassword) => {
    setShowPassword(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const onSubmit = async (data: ResetPasswordFormData) => {
    try {
      setApiError(null);
      const { confirmPassword, ...submitData } = data;
      
      const response: IResponse<string> = await changePassword(submitData);
      
      if (response.success) {
        setIsSuccess(true);
        reset();
        // Redirigir al login después de 3 segundos
        setTimeout(() => {
          router.push('/auth/login');
        }, 3000);
      } else {
        setApiError(response.error?.message || 'Error al restablecer la contraseña');
      }
    } catch (error: any) {
      setApiError(error.message || 'Ocurrió un error inesperado');
    }
  };

  if (isSuccess) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
        <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
            <svg
              className="h-6 w-6 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">¡Contraseña actualizada!</h2>
          <p className="text-gray-600">Tu contraseña ha sido restablecida exitosamente.</p>
          <p className="text-sm text-gray-500">Serás redirigido al inicio de sesión en unos segundos...</p>
          <Link
            href="/auth/login"
            className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Volver al inicio de sesión
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Restablecer Contraseña</h2>
          <p className="mt-2 text-sm text-gray-600">
            Ingresa tu correo electrónico y palabra de seguridad para restablecer tu contraseña
          </p>
        </div>

        {apiError && (
          <div className="p-4 text-sm text-red-700 bg-red-100 rounded-lg">
            {apiError}
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
                disabled={isSubmitting}
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
            <label htmlFor="securityWord" className="block text-sm font-medium text-gray-700">
              Palabra de Seguridad
            </label>
            <div className="relative mt-1">
              <input
                id="securityWord"
                {...register('securityWord')}
                type={showPassword.securityWord ? 'text' : 'password'}
                disabled={isSubmitting}
                className={`w-full px-3 py-2 pr-10 text-black border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.securityWord ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('securityWord')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                tabIndex={-1}
              >
                {showPassword.securityWord ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
              {errors.securityWord && (
                <p className="mt-1 text-sm text-red-600">{errors.securityWord.message}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
              Nueva Contraseña
            </label>
            <div className="relative mt-1">
              <input
                id="newPassword"
                {...register('newPassword')}
                type={showPassword.newPassword ? 'text' : 'password'}
                disabled={isSubmitting}
                className={`w-full px-3 py-2 pr-10 text-black border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.newPassword ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('newPassword')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                tabIndex={-1}
              >
                {showPassword.newPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
              {errors.newPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.newPassword.message}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              Confirmar Nueva Contraseña
            </label>
            <div className="relative mt-1">
              <input
                id="confirmPassword"
                {...register('confirmPassword')}
                type={showPassword.confirmPassword ? 'text' : 'password'}
                disabled={isSubmitting}
                className={`w-full px-3 py-2 pr-10 text-black border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('confirmPassword')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                tabIndex={-1}
              >
                {showPassword.confirmPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
              )}
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Procesando...' : 'Restablecer Contraseña'}
            </button>
          </div>
        </form>

        <div className="text-center text-sm">
          <Link 
            href="/auth/login" 
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Volver al inicio de sesión
          </Link>
        </div>
      </div>
    </div>
  );
}
