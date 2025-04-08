'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { Form, InputField, SelectField, Button, Alert } from '@/components/Forms';
import ImageUploader from '@/components/ImageUploader';
import Navbar from '@/components/Navbar';
import { apiPost } from '@/lib/api';
import { useAuthStore } from '@/context/AuthContext';

// Validation schema
const registerSchema = z.object({
  email: z.string()
    .email('Ingresa un email válido')
    .min(1, 'El email es requerido'),
  name: z.string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(50, 'El nombre no puede exceder 50 caracteres'),
  identification: z.string()
    .min(5, 'La identificación debe tener al menos 5 caracteres')
    .max(20, 'La identificación no puede exceder 20 caracteres'),
  role: z.enum(['ADMIN', 'EMPLOYEE', 'STUDENT'], {
    errorMap: () => ({ message: 'Selecciona un rol válido' }),
  }),
  position: z.string().optional(),
  password: z.string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .max(100, 'La contraseña no puede exceder 100 caracteres'),
  passwordConfirm: z.string()
    .min(1, 'Confirma tu contraseña'),
}).refine((data) => data.password === data.passwordConfirm, {
  message: "Las contraseñas no coinciden",
  path: ["passwordConfirm"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      name: '',
      identification: '',
      role: 'STUDENT',
      position: '',
      password: '',
      passwordConfirm: '',
    },
  });

  const selectedRole = watch('role');

  const onSubmit = async (data: RegisterFormData) => {
    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      // Create FormData if there's a photo to upload
      const formData = new FormData();
      formData.append('email', data.email);
      formData.append('name', data.name);
      formData.append('identification', data.identification);
      formData.append('role', data.role);
      formData.append('password', data.password);
      
      if (data.position) {
        formData.append('position', data.position);
      }
      
      if (photoFile) {
        formData.append('photo', photoFile);
      }

      // Instead of making an actual API call, we'll just simulate it
      // const response = await apiPost('/users', formData, {
      //   headers: {
      //     'Content-Type': 'multipart/form-data',
      //   },
      // });
      
      // Simulate successful response
      console.log('Registration data:', data, photoFile);
      
      setSuccessMessage('Usuario registrado exitosamente');
      reset(); // Reset form
      setPhotoFile(null);
      
      // After successful registration, redirect to users page or login
      setTimeout(() => {
        router.push('/users');
      }, 2000);
    } catch (err: any) {
      console.error('Registration error:', err);
      setErrorMessage(err.message || 'Error al registrar usuario. Por favor, intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-[#2C78DA]">Acceso restringido</h1>
            <p className="mt-2 text-gray-600">No tienes permisos para acceder a esta página</p>
          </div>
          <div className="flex justify-center">
            <Link href="/login">
              <Button>Volver al inicio</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="page-container">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Registro de Usuario</h1>
          <p className="text-gray-600">
            Crea una nueva cuenta de usuario
          </p>
        </div>
        
        {successMessage && (
          <Alert
            type="success"
            message={successMessage}
            onClose={() => setSuccessMessage(null)}
          />
        )}
        
        {errorMessage && (
          <Alert
            type="error"
            message={errorMessage}
            onClose={() => setErrorMessage(null)}
          />
        )}
        
        <div className="bg-white rounded-lg shadow overflow-hidden p-6">
          <Form<RegisterFormData>
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-6">
                <InputField
                  name="email"
                  label="Email"
                  control={control}
                  type="email"
                  placeholder="correo@ejemplo.com"
                  required
                  error={errors.email?.message}
                />
                
                <InputField
                  name="name"
                  label="Nombre completo"
                  control={control}
                  placeholder="Nombre y apellidos"
                  required
                  error={errors.name?.message}
                />
                
                <InputField
                  name="identification"
                  label="Identificación"
                  control={control}
                  placeholder="Número de identificación"
                  required
                  error={errors.identification?.message}
                />
                
                <SelectField
                  name="role"
                  label="Rol"
                  control={control}
                  options={[
                    { value: 'ADMIN', label: 'Administrador' },
                    { value: 'EMPLOYEE', label: 'Empleado' },
                    { value: 'STUDENT', label: 'Estudiante' },
                  ]}
                  required
                  error={errors.role?.message}
                />
                
                {(selectedRole === 'ADMIN' || selectedRole === 'EMPLOYEE') && (
                  <InputField
                    name="position"
                    label="Cargo"
                    control={control}
                    placeholder="Cargo o posición"
                    error={errors.position?.message}
                  />
                )}
              </div>
              
              <div className="space-y-6">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Foto de perfil (opcional)
                  </label>
                  <ImageUploader
                    onImageChange={(file) => setPhotoFile(file)}
                  />
                </div>
                
                <InputField
                  name="password"
                  label="Contraseña"
                  control={control}
                  type="password"
                  placeholder="Contraseña"
                  required
                  error={errors.password?.message}
                />
                
                <InputField
                  name="passwordConfirm"
                  label="Confirmar contraseña"
                  control={control}
                  type="password"
                  placeholder="Confirma tu contraseña"
                  required
                  error={errors.passwordConfirm?.message}
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200">
              <Link href="/users">
                <Button
                  type="button"
                  variant="secondary"
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
              </Link>
              <Button
                type="submit"
                isLoading={isSubmitting}
              >
                Registrar usuario
              </Button>
            </div>
          </Form>
        </div>
      </main>
    </div>
  );
} 