import api from '@/app/lib/axios'
import type { ISelect, ILoginParams, IRegisterParams, IUser } from '@/app/types/auth'
import type { IResponse } from '@/app/types/response'

export const login = async (params: ILoginParams): Promise<IResponse<IUser>> => {
  const response = await api.post<IResponse<IUser>>('/authentication/login', params)
  return response.data
}

export const getCarriers = async (): Promise<ISelect[]> => {
    const response = await api.get<{
      success: boolean;
      data: ISelect[];
      error: null;
    }>('/carriers/active');
  
    return response.data.data;
  };

  export const registerUser = async (params: IRegisterParams): Promise<IResponse<string>> => {
    const formData = new FormData();
  
    // Campos básicos
    formData.append('email', params.email);
    formData.append('identification', params.identification);
    formData.append('name', params.name);
    formData.append('password', params.password);
    formData.append('securityWord', params.securityWord);
    formData.append('role', params.role.toString());
  
    // Lista de careerIds
    if (params.careerIds && params.careerIds.length > 0) {
      params.careerIds.forEach(careerId => {
        formData.append('careerIds', careerId.toString());
      });
    }
  
    // Campo opcional: position
    if (params.position) {
      formData.append('position', params.position);
    }
  
    // Campo opcional: isActive
    if (params.isActive !== undefined && params.isActive !== null) {
      formData.append('isActive', params.isActive.toString());
    }
  
    const response = await api.post<IResponse<string>>(
      '/authentication/register',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
  
    return response.data;
  };

  export interface IChangePasswordParams {
    email: string;
    securityWord: string;
    newPassword: string;
  }

  export const changePassword = async (params: IChangePasswordParams): Promise<IResponse<string>> => {
    const response = await api.post<IResponse<string>>('/authentication/changePassword', {
      email: params.email,
      securityWord: params.securityWord,
      newPassword: params.newPassword
    });
    
    return response.data;
  };
  