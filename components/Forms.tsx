'use client';

import { useState } from 'react';
import { useForm, Controller, SubmitHandler, FieldValues, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Common button component
export const Button = ({ 
  children, 
  type = 'button',
  variant = 'primary', 
  isLoading = false,
  className = '',
  ...props 
}: {
  children: React.ReactNode;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'danger';
  isLoading?: boolean;
  className?: string;
  [key: string]: any;
}) => {
  const baseStyle = 'px-4 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50';
  
  const variantStyles = {
    primary: 'bg-[#2C78DA] hover:bg-[#2368c0] text-white focus:ring-[#2C78DA]',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800 focus:ring-gray-500',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500'
  };

  return (
    <button
      type={type}
      className={`${baseStyle} ${variantStyles[variant]} ${className}`}
      disabled={isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center justify-center">
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Cargando...
        </span>
      ) : children}
    </button>
  );
};

// Input field component
export const InputField = <T extends FieldValues>({ 
  name,
  label,
  control,
  type = 'text',
  placeholder = '',
  required = false,
  error,
  ...props
}: {
  name: string;
  label: string;
  control: any;
  type?: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  [key: string]: any;
}) => {
  return (
    <div className="mb-4">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <Controller
        name={name}
        control={control}
        render={({ field, fieldState: { error: fieldError } }) => (
          <>
            <input
              id={name}
              type={type}
              placeholder={placeholder}
              className={`w-full px-3 py-2 border ${
                fieldError || error ? 'border-red-500' : 'border-gray-300'
              } rounded-md shadow-sm focus:outline-none focus:ring-[#2C78DA] focus:border-[#2C78DA]`}
              {...field}
              {...props}
            />
            {(fieldError || error) && (
              <p className="mt-1 text-sm text-red-600">
                {fieldError?.message?.toString() || error}
              </p>
            )}
          </>
        )}
      />
    </div>
  );
};

// Textarea field component
export const TextareaField = <T extends FieldValues>({
  name,
  label,
  control,
  placeholder = '',
  required = false,
  rows = 3,
  error,
  ...props
}: {
  name: string;
  label: string;
  control: any;
  placeholder?: string;
  required?: boolean;
  rows?: number;
  error?: string;
  [key: string]: any;
}) => {
  return (
    <div className="mb-4">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <Controller
        name={name}
        control={control}
        render={({ field, fieldState: { error: fieldError } }) => (
          <>
            <textarea
              id={name}
              placeholder={placeholder}
              rows={rows}
              className={`w-full px-3 py-2 border ${
                fieldError || error ? 'border-red-500' : 'border-gray-300'
              } rounded-md shadow-sm focus:outline-none focus:ring-[#2C78DA] focus:border-[#2C78DA]`}
              {...field}
              {...props}
            />
            {(fieldError || error) && (
              <p className="mt-1 text-sm text-red-600">
                {fieldError?.message?.toString() || error}
              </p>
            )}
          </>
        )}
      />
    </div>
  );
};

// Select field component
export const SelectField = <T extends FieldValues>({
  name,
  label,
  control,
  options,
  required = false,
  error,
  ...props
}: {
  name: string;
  label: string;
  control: any;
  options: { value: string; label: string }[];
  required?: boolean;
  error?: string;
  [key: string]: any;
}) => {
  return (
    <div className="mb-4">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <Controller
        name={name}
        control={control}
        render={({ field, fieldState: { error: fieldError } }) => (
          <>
            <select
              id={name}
              className={`w-full px-3 py-2 border ${
                fieldError || error ? 'border-red-500' : 'border-gray-300'
              } rounded-md shadow-sm focus:outline-none focus:ring-[#2C78DA] focus:border-[#2C78DA]`}
              {...field}
              {...props}
            >
              <option value="">Seleccionar</option>
              {options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {(fieldError || error) && (
              <p className="mt-1 text-sm text-red-600">
                {fieldError?.message?.toString() || error}
              </p>
            )}
          </>
        )}
      />
    </div>
  );
};

// Checkbox field component
export const CheckboxField = <T extends FieldValues>({
  name,
  label,
  control,
  error,
  ...props
}: {
  name: string;
  label: string;
  control: any;
  error?: string;
  [key: string]: any;
}) => {
  return (
    <div className="mb-4 flex items-center">
      <Controller
        name={name}
        control={control}
        render={({ field, fieldState: { error: fieldError } }) => (
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id={name}
                type="checkbox"
                className="h-4 w-4 text-[#2C78DA] border-gray-300 rounded focus:ring-[#2C78DA]"
                checked={field.value}
                onChange={field.onChange}
                {...props}
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor={name} className="font-medium text-gray-700">
                {label}
              </label>
              {(fieldError || error) && (
                <p className="text-red-600">
                  {fieldError?.message?.toString() || error}
                </p>
              )}
            </div>
          </div>
        )}
      />
    </div>
  );
};

// Form component with error handling
export const Form = <T extends FieldValues>({
  onSubmit,
  children,
  schema,
  className = '',
  ...props
}: {
  onSubmit: (data: T) => void | Promise<void>;
  children: React.ReactNode;
  schema?: z.ZodType<any, any>;
  className?: string;
  [key: string]: any;
}) => {
  const methods = useForm<T>({
    resolver: schema ? zodResolver(schema) : undefined,
  });

  const handleSubmit: SubmitHandler<T> = (data) => {
    onSubmit(data);
  };

  return (
    <form 
      onSubmit={methods.handleSubmit(handleSubmit)} 
      className={`space-y-4 ${className}`}
      {...props}
    >
      {children}
    </form>
  );
};

// Alert component for form feedback
export const Alert = ({ 
  type = 'success', 
  message,
  onClose
}: {
  type?: 'success' | 'error' | 'warning' | 'info';
  message: string;
  onClose?: () => void;
}) => {
  const [isVisible, setIsVisible] = useState(true);

  const handleClose = () => {
    setIsVisible(false);
    if (onClose) onClose();
  };

  if (!isVisible) return null;

  const alertStyles = {
    success: 'bg-green-50 border-green-500 text-green-700',
    error: 'bg-red-50 border-red-500 text-red-700',
    warning: 'bg-yellow-50 border-yellow-500 text-yellow-700',
    info: 'bg-blue-50 border-blue-500 text-blue-700',
  };

  return (
    <div className={`p-4 mb-4 border-l-4 rounded-md ${alertStyles[type]}`} role="alert">
      <div className="flex justify-between items-center">
        <p>{message}</p>
        <button 
          onClick={handleClose}
          className="text-gray-400 hover:text-gray-500"
          aria-label="Close"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}; 