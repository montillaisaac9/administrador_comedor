export interface ILoginParams {
    email: string
    password: string
  }
  
  export interface IUser {
    id: number
    email: string
    name: string
    identification: string
    role: Role
    securityWord: string
    position?: string
    isActive: boolean
    photo: string | null
    careers: {
      id: number
      name: string
    }[]
  }

  // types/auth.ts
export type Role = 'EMPLOYEE';

export interface IRegisterParams {
  email: string;          
  identification: string;
  name: string;           
  password: string;       
  securityWord: string;   
  role: Role;            
  position?: string;      
  isActive?: boolean;    
  careerIds: number[]; 
}

export interface ICarrier {
  id: number;
  name: string;
}

  