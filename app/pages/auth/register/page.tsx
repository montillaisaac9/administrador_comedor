'use client';
import { useState, useEffect } from 'react';
import { Eye, EyeOff, Plus, Minus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { getCarriers, registerUser } from '@/app/service/auth.service'; // Importamos el servicio
import SuccessModal, { AlertType } from '@/app/components/SuccessModal';
import type { IResponse } from '@/app/types/response';
import type { IRegisterParams } from '@/app/types/auth';
import type { ICarrier } from '@/app/types/auth'; // Asumimos que existe este tipo

// Define schema for form validation, agregando "securityWord", "cedula" y "careerIds"
const registrationSchema = z
  .object({
    fullName: z
      .string()
      .min(1, { message: 'El nombre completo es requerido' })
      .min(3, { message: 'El nombre debe tener al menos 3 caracteres' }),
    email: z
      .string()
      .min(1, { message: 'El email es requerido' })
      .email({ message: 'Introduce un email válido' }),
    cedula: z.string().min(1, { message: 'La cédula es requerida' }),
    position: z.string().min(1, { message: 'El cargo es requerido' }),
    securityWord: z.string().min(1, { message: 'La palabra de seguridad es requerida' }),
    password: z
      .string()
      .min(1, { message: 'La contraseña es requerida' })
      .min(6, { message: 'La contraseña debe tener al menos 6 caracteres' }),
    confirmPassword: z.string().min(1, { message: 'Confirmar la contraseña es requerido' }),
    careerIds: z.array(z.string().min(1, { message: 'Debe seleccionar al menos una carrera' }))
      .min(1, { message: 'Debe seleccionar al menos una carrera' })
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

// TypeScript type for our form data
type RegistrationFormData = z.infer<typeof registrationSchema>;

// Define un tipo para el estado del modal
interface ModalState {
  message: string;
  alertType: AlertType;
}

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [modalState, setModalState] = useState<ModalState | null>(null);
  const [carriers, setCarriers] = useState<ICarrier[]>([]);
  const [careerSelectors, setCareerSelectors] = useState<number[]>([0]); // Comenzamos con un selector
  const [isLoading, setIsLoading] = useState(true);
  
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      fullName: '',
      email: '',
      cedula: '',
      position: '',
      securityWord: '',
      password: '',
      confirmPassword: '',
      careerIds: [],
    },
  });

  // Observar los valores de careerIds para actualizar el estado
  const selectedCareers = watch('careerIds');

  // Carga las carreras cuando el componente se monta
  useEffect(() => {
    const fetchCarriers = async () => {
      try {
        const carriersData = await getCarriers();
        setCarriers(carriersData);
        setIsLoading(false);
      } catch (error) {
        console.error('Error al cargar las carreras:', error);
        setIsLoading(false);
      }
    };

    fetchCarriers();
  }, []);

  // Función para añadir un nuevo selector de carrera
  const addCareerSelector = () => {
    if (careerSelectors.length < 3) {
      setCareerSelectors([...careerSelectors, careerSelectors.length]);
    }
  };

  // Función para eliminar un selector de carrera
  const removeCareerSelector = (index: number) => {
    const updatedSelectors = careerSelectors.filter((_, i) => i !== index);
    setCareerSelectors(updatedSelectors);
    
    // Actualizar los careerIds en el formulario
    const currentCareers = [...selectedCareers];
    currentCareers.splice(index, 1);
    setValue('careerIds', currentCareers);
  };

  // Manejar cambio en un selector de carrera
  const handleCareerChange = (index: number, value: string) => {
    const currentCareers = [...(selectedCareers || [])];
    currentCareers[index] = value;
    setValue('careerIds', currentCareers);
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword((prev) => !prev);
  };

  const onSubmit = async (data: RegistrationFormData) => {
    try {
      // Mapea los datos del formulario al payload del registro
      const payload: IRegisterParams = {
        email: data.email,
        identification: data.cedula, // Se asigna la cédula como identificación
        name: data.fullName,
        password: data.password,
        securityWord: data.securityWord, // Se envía la palabra de seguridad ingresada
        role: 'EMPLOYEE', // Rol por defecto
        position: data.position,
        isActive: true, // Activado por defecto
        careerIds: data.careerIds.map(id => parseInt(id))// Ahora incluimos las carreras seleccionadas
      };

      const response: IResponse<string> = await registerUser(payload);
      if (response.success) {
        setModalState({
          message: response?.data ? response.data : "Registro de Usuario Exitoso",
          alertType: AlertType.SUCCESS,
        });
      } else {
        console.log(response.error);
        setModalState({
          message: response.error?.message || 'Error desconocido',
          alertType: AlertType.ERROR,
        });
      }
    } catch (error: unknown) {      
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setModalState({
        message: errorMessage,
        alertType: AlertType.ERROR,
      });
    }
  };

  // Maneja el cierre del modal y redirige al login si el registro fue exitoso
  const handleModalClose = () => {
    const isSuccess = modalState?.alertType === AlertType.SUCCESS;
    setModalState(null);
    if (isSuccess) {
      router.push('/pages/auth/login');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-blue-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Registro de Administrativo</h2>
          <p className="text-sm text-gray-600">
            Crea una nueva cuenta para el sistema del comedor UPEBG
          </p>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <input
              id="fullName"
              {...register('fullName')}
              type="text"
              placeholder="Nombre completo"
              className={`w-full px-3 py-2 text-black border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.fullName ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.fullName && (
              <p className="mt-1 text-xs text-red-600">{errors.fullName.message}</p>
            )}
          </div>
          <div>
            <input
              id="email"
              {...register('email')}
              type="email"
              placeholder="Email"
              className={`w-full px-3 py-2 text-black border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
            )}
          </div>
          <div>
            <input
              id="cedula"
              {...register('cedula')}
              type="text"
              placeholder="Cédula"
              className={`w-full px-3 py-2 text-black border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.cedula ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.cedula && (
              <p className="mt-1 text-xs text-red-600">{errors.cedula.message}</p>
            )}
          </div>
          <div>
            <input
              id="position"
              {...register('position')}
              type="text"
              placeholder="Cargo"
              className={`w-full px-3 py-2 text-black border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.position ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.position && (
              <p className="mt-1 text-xs text-red-600">{errors.position.message}</p>
            )}
          </div>

          {/* Sección de selectores de carreras */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">Carreras</label>
            {isLoading ? (
              <p className="text-sm text-gray-500">Cargando carreras...</p>
            ) : (
              <>
                {careerSelectors.map((_, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <select
                      className={`flex-grow w-full px-3 py-2 text-black border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.careerIds ? 'border-red-500' : 'border-gray-300'
                      }`}
                      onChange={(e) => handleCareerChange(index, e.target.value)}
                      value={selectedCareers?.[index] || ''}
                    >
                      <option value="">Selecciona una carrera</option>
                      {carriers.map((carrier) => (
                        <option key={carrier.id} value={carrier.id}>
                          {carrier.name}
                        </option>
                      ))}
                    </select>
                    
                    {/* Botones para añadir o eliminar selectores */}
                    <div className="flex space-x-1">
                      {index === careerSelectors.length - 1 && careerSelectors.length < 3 && (
                        <button
                          type="button"
                          onClick={addCareerSelector}
                          className="p-2 text-white bg-green-500 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      )}
                      {careerSelectors.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeCareerSelector(index)}
                          className="p-2 text-white bg-red-500 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </>
            )}
            {errors.careerIds && (
              <p className="mt-1 text-xs text-red-600">{errors.careerIds.message}</p>
            )}
          </div>

          <div>
            <input
              id="securityWord"
              {...register('securityWord')}
              type="text"
              placeholder="Palabra de seguridad"
              className={`w-full px-3 py-2 text-black border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.securityWord ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.securityWord && (
              <p className="mt-1 text-xs text-red-600">{errors.securityWord.message}</p>
            )}
          </div>
          <div className="relative">
            <input
              id="password"
              {...register('password')}
              type={showPassword ? 'text' : 'password'}
              placeholder="Contraseña"
              className={`w-full px-3 py-2 text-black border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" aria-hidden="true" />
              ) : (
                <Eye className="w-4 h-4" aria-hidden="true" />
              )}
            </button>
            {errors.password && (
              <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
            )}
          </div>
          <div className="relative">
            <input
              id="confirmPassword"
              {...register('confirmPassword')}
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirmar contraseña"
              className={`w-full px-3 py-2 text-black border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            <button
              type="button"
              onClick={toggleConfirmPasswordVisibility}
              className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-700"
            >
              {showConfirmPassword ? (
                <EyeOff className="w-4 h-4" aria-hidden="true" />
              ) : (
                <Eye className="w-4 h-4" aria-hidden="true" />
              )}
            </button>
            {errors.confirmPassword && (
              <p className="mt-1 text-xs text-red-600">{errors.confirmPassword.message}</p>
            )}
          </div>
          <div className="flex justify-between pt-4">
            <button
              type="button"
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              onClick={() => router.push('/pages/auth/login')}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-black border border-transparent rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Procesando...' : 'Registrar'}
            </button>
          </div>
        </form>
      </div>
      {/* Modal personalizado que se muestra según la respuesta */}
      {modalState && (
        <SuccessModal 
          message={modalState.message}
          alertType={modalState.alertType}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
}