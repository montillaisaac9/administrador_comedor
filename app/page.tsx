'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Redirigir a la página de login inmediatamente
    const redirect = setTimeout(() => {
      router.replace('/login');
    }, 100);
    
    // Limpiar el timeout si el componente se desmonta
    return () => clearTimeout(redirect);
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="relative w-16 h-16">
        <div className="absolute top-0 left-0 w-full h-full animate-spin rounded-full border-4 border-transparent border-t-primary border-b-primary"></div>
      </div>
      <p className="mt-4 text-muted-foreground font-medium">Redirigiendo al inicio de sesión...</p>
    </div>
  );
}
