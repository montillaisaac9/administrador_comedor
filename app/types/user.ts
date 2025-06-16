export type UserRole = 'USER' | 'ADMIN' | 'EMPLOYEE';

export interface User {
  id: number;
  email: string;
  name: string;
  role: UserRole;
}

export interface CreateUserDto {
  email: string;
  password: string;
  name: string;
  role?: UserRole;
  identification: string;
}

export interface UpdateUserDto {
  email?: string;
  password?: string;
  name?: string;
  role?: UserRole;
}
