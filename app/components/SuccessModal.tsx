// components/SuccessModal.tsx
'use client';

import { FC } from 'react';

// Enum con los tipos de alerta
export enum AlertType {
  SUCCESS = 'success',
  ERROR = 'error',
  WARNING = 'warning',
}

interface AlertModalProps {
  message: string;
  alertType: AlertType;
  onClose: () => void;
}

// Función auxiliar para obtener título y clases de colores
const getTitleAndColors = (alertType: AlertType) => {
  switch (alertType) {
    case AlertType.SUCCESS:
      return {
        title: 'Registro Exitoso',
        titleColor: 'text-green-600',
        btnColor: 'bg-green-600',
        btnHover: 'hover:bg-green-700',
      };
    case AlertType.ERROR:
      return {
        title: 'Error',
        titleColor: 'text-red-600',
        btnColor: 'bg-red-600',
        btnHover: 'hover:bg-red-700',
      };
    case AlertType.WARNING:
      return {
        title: 'Advertencia',
        titleColor: 'text-yellow-600',
        btnColor: 'bg-yellow-600',
        btnHover: 'hover:bg-yellow-700',
      };
    default:
      return {
        title: '',
        titleColor: 'text-gray-600',
        btnColor: 'bg-blue-600',
        btnHover: 'hover:bg-blue-700',
      };
  }
};

const SuccessModal: FC<AlertModalProps> = ({ message, alertType, onClose }) => {
  const { title, titleColor, btnColor, btnHover } = getTitleAndColors(alertType);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-sm p-6 bg-white rounded-lg shadow-lg">
        <h2 className={`mb-4 text-xl font-bold ${titleColor}`}>{title}</h2>
        <p className="mb-6 text-gray-700">{message}</p>
        <button 
          onClick={onClose} 
          className={`w-full px-4 py-2 text-white ${btnColor} ${btnHover} rounded focus:outline-none`}
        >
          Ir a Iniciar Sesión
        </button>
      </div>
    </div>
  );
};

export default SuccessModal;
