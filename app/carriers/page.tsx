'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Navbar from '@/components/Navbar';
import { Table } from '@/components/Tables';
import { Button, Form, InputField, TextareaField, CheckboxField, Alert } from '@/components/Forms';
import { Modal, ConfirmationModal } from '@/components/Modals';
import { apiGet, apiPost, apiPatch, apiDelete } from '@/lib/api';

// Define types
interface Carrier {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Define validation schema
const carrierSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
});

type CarrierFormData = z.infer<typeof carrierSchema>;

export default function CarriersPage() {
  const router = useRouter();
  const [carriers, setCarriers] = useState<Carrier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCarrier, setSelectedCarrier] = useState<Carrier | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [operationSuccess, setOperationSuccess] = useState<{ message: string; type: 'add' | 'edit' | 'delete' } | null>(null);

  // Define form
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<CarrierFormData>({
    resolver: zodResolver(carrierSchema),
    defaultValues: {
      name: '',
      description: '',
      isActive: true,
    },
  });

  // Fetch carriers
  const fetchCarriers = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // In a real implementation, you'd fetch this data from the API
      // const response = await apiGet<Carrier[]>('/carriers');
      // setCarriers(response);
      
      // Simulated response for now
      const mockCarriers: Carrier[] = [
        {
          id: '1',
          name: 'Ingeniería Informática',
          description: 'Carrera de Ingeniería Informática',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '2',
          name: 'Medicina',
          description: 'Carrera de Medicina',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '3',
          name: 'Derecho',
          description: 'Facultad de Derecho',
          isActive: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
      
      setCarriers(mockCarriers);
    } catch (err: any) {
      console.error('Error fetching carriers:', err);
      setError('Error al cargar las carreras. Por favor, intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCarriers();
  }, []);

  // Handle create/edit carrier
  const handleCreateEditCarrier = async (data: CarrierFormData) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      if (selectedCarrier) {
        // Edit carrier
        // await apiPatch<Carrier>(`/carriers/${selectedCarrier.id}`, data);
        // Update local state
        setCarriers(prev => prev.map(carrier => 
          carrier.id === selectedCarrier.id 
            ? { ...carrier, ...data, updatedAt: new Date().toISOString() } 
            : carrier
        ));
        setOperationSuccess({
          message: 'Carrera actualizada exitosamente',
          type: 'edit'
        });
      } else {
        // Create carrier
        // const newCarrier = await apiPost<Carrier>('/carriers', data);
        // Simulate API response
        const newCarrier: Carrier = {
          id: Date.now().toString(),
          ...data,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        // Update local state
        setCarriers(prev => [...prev, newCarrier]);
        setOperationSuccess({
          message: 'Carrera creada exitosamente',
          type: 'add'
        });
      }
      
      // Close modal and reset form
      setShowModal(false);
      reset();
      setSelectedCarrier(null);
    } catch (err: any) {
      console.error('Error saving carrier:', err);
      setError(err.message || 'Error al guardar la carrera. Por favor, intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete carrier
  const handleDeleteCarrier = async () => {
    if (!selectedCarrier) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Delete carrier
      // await apiDelete(`/carriers/${selectedCarrier.id}`);
      
      // Update local state
      setCarriers(prev => prev.filter(carrier => carrier.id !== selectedCarrier.id));
      setShowDeleteModal(false);
      setSelectedCarrier(null);
      setOperationSuccess({
        message: 'Carrera eliminada exitosamente',
        type: 'delete'
      });
    } catch (err: any) {
      console.error('Error deleting carrier:', err);
      setError(err.message || 'Error al eliminar la carrera. Por favor, intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open edit modal
  const handleEditCarrier = (carrier: Carrier) => {
    setSelectedCarrier(carrier);
    setValue('name', carrier.name);
    setValue('description', carrier.description || '');
    setValue('isActive', carrier.isActive);
    setShowModal(true);
  };

  // Open delete modal
  const handleConfirmDelete = (carrier: Carrier) => {
    setSelectedCarrier(carrier);
    setShowDeleteModal(true);
  };

  // Table columns
  const columns = [
    {
      header: 'Nombre',
      accessor: 'name',
    },
    {
      header: 'Descripción',
      accessor: (carrier: Carrier) => carrier.description || 'N/A',
    },
    {
      header: 'Estado',
      accessor: (carrier: Carrier) => (
        <span className={`px-2 py-1 rounded-full text-xs ${
          carrier.isActive 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {carrier.isActive ? 'Activo' : 'Inactivo'}
        </span>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="page-container">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Gestión de Carreras</h1>
            <p className="text-gray-600">
              Administra las carreras disponibles en el sistema
            </p>
          </div>
          <Button
            onClick={() => {
              setSelectedCarrier(null);
              reset(); // Reset form
              setShowModal(true);
            }}
          >
            Nueva Carrera
          </Button>
        </div>
        
        {operationSuccess && (
          <Alert
            type="success"
            message={operationSuccess.message}
            onClose={() => setOperationSuccess(null)}
          />
        )}
        
        {error && (
          <Alert
            type="error"
            message={error}
            onClose={() => setError(null)}
          />
        )}
        
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <Table
            columns={columns}
            data={carriers}
            keyField="id"
            isLoading={isLoading}
            emptyMessage="No hay carreras disponibles"
            actionButtons={(carrier: Carrier) => (
              <div className="flex space-x-2 justify-end">
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditCarrier(carrier);
                  }}
                  variant="secondary"
                  className="text-xs py-1"
                >
                  Editar
                </Button>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleConfirmDelete(carrier);
                  }}
                  variant="danger"
                  className="text-xs py-1"
                >
                  Eliminar
                </Button>
              </div>
            )}
          />
        </div>
        
        {/* Create/Edit Modal */}
        <Modal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setSelectedCarrier(null);
          }}
          title={selectedCarrier ? 'Editar Carrera' : 'Nueva Carrera'}
          size="md"
        >
          <Form
            onSubmit={handleSubmit(handleCreateEditCarrier)}
          >
            <InputField
              name="name"
              label="Nombre"
              control={control}
              placeholder="Ej: Ingeniería Informática"
              required
              error={errors.name?.message}
            />
            
            <TextareaField
              name="description"
              label="Descripción"
              control={control}
              placeholder="Descripción de la carrera (opcional)"
              rows={4}
            />
            
            <CheckboxField
              name="isActive"
              label="Activo"
              control={control}
            />
            
            <div className="flex justify-end space-x-2 mt-6">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setShowModal(false);
                  setSelectedCarrier(null);
                }}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                isLoading={isSubmitting}
              >
                {selectedCarrier ? 'Actualizar' : 'Crear'}
              </Button>
            </div>
          </Form>
        </Modal>
        
        {/* Delete Confirmation Modal */}
        <ConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteCarrier}
          title="Eliminar Carrera"
          message={`¿Estás seguro de que deseas eliminar la carrera "${selectedCarrier?.name}"? Esta acción no se puede deshacer.`}
          confirmText="Eliminar"
          cancelText="Cancelar"
          isLoading={isSubmitting}
          isDanger
        />
      </main>
    </div>
  );
} 