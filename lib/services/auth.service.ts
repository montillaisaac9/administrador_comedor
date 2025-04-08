import api from '../api';

export interface IAuthService {
  login(email: string, password: string): Promise<any>;
  register(userData: any): Promise<any>;
  logout(): Promise<void>;
  changePassword(data: { email: string; securityWord: string; newPassword: string }): Promise<any>;
}

class AuthService implements IAuthService {
  async login(email: string, password: string): Promise<any> {
    try {
      const response = await api.post('/authentication/login', { email, password });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async register(userData: any): Promise<any> {
    try {
      const response = await api.post('/authentication/register', userData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async logout(): Promise<void> {
    try {
      await api.post('/authentication/logout');
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async changePassword(data: { email: string; securityWord: string; newPassword: string }): Promise<any> {
    try {
      const response = await api.post('/authentication/changePassword', data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private handleError(error: any): Error {
    if (error.response) {
      return new Error(error.response.data.message || 'An error occurred');
    }
    return new Error('Network error');
  }
}

export const authService = new AuthService(); 