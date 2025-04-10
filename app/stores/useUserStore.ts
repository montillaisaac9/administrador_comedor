// src/stores/useUserStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { IUser } from '../types/auth';

// Interface para nuestro estado
interface UserState {
  user: IUser | null;
  isAuthenticated: boolean;
  token: string | null;
  setUser: (user: IUser) => void;
  setToken: (token: string) => void;
  setUserAndToken: (user: IUser, token: string) => void;
  logout: () => void;
}

// Creamos y exportamos nuestro store
const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      token: null,
      setUser: (user) => set({ 
        user, 
        isAuthenticated: true 
      }),
      setToken: (token) => set({ token }),
      setUserAndToken: (user, token) => set({ user, token, isAuthenticated: true }),
      logout: () => set({ 
        user: null, 
        isAuthenticated: false, 
        token: null 
      }),
    }),
    {
      name: 'user-storage', // nombre para localStorage
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default useUserStore;
