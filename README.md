# Administrador de Comedor Universitario

Panel administrativo para la gestión de un comedor universitario, desarrollado con Next.js, TypeScript, Tailwind CSS, Zustand y React Hook Form.

## Características

- Autenticación y gestión de usuarios
- Gestión de carreras universitarias
- Administración de platos y menús
- Sistema de calificaciones y comentarios
- Interfaz moderna con Tailwind CSS
- Gestión de estado global con Zustand
- Validación de formularios con React Hook Form y Zod

## Requisitos previos

- Node.js 18 o superior
- Backend API (debe estar corriendo en http://localhost:3000)

## Instalación

1. Clona el repositorio:

```bash
git clone https://github.com/tu-usuario/administrador-comedor.git
cd administrador-comedor
```

2. Instala las dependencias:

```bash
npm install
```

3. Crea un archivo `.env.local` en la raíz del proyecto y agrega:

```
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## Desarrollo

Para iniciar el servidor de desarrollo:

```bash
npm run dev
```

La aplicación estará disponible en: [http://localhost:3001](http://localhost:3001)

## Construcción para producción

Para construir la aplicación para producción:

```bash
npm run build
```

Para iniciar la versión de producción:

```bash
npm start
```

## Estructura de carpetas

```
/app                   # Carpetas y páginas de la aplicación (App Router de Next.js)
  /login               # Página de login
  /register            # Página de registro de usuarios
  /dashboard           # Panel principal
  /users               # Gestión de usuarios
  /carriers            # Gestión de carreras
  /dishes              # Gestión de platos
  /menus               # Gestión de menús
  /comments/[dishId]   # Comentarios de un plato específico
  /ratings/[dishId]    # Calificaciones de un plato específico
  layout.tsx           # Diseño principal de la aplicación
/components            # Componentes reutilizables
  Navbar.tsx           # Barra de navegación
  Forms.tsx            # Componentes de formularios
  Tables.tsx           # Tablas para visualización de datos
  ImageUploader.tsx    # Componente para subir imágenes
  Modals.tsx           # Componentes de modales
/context               # Estado global con Zustand
  AuthContext.tsx      # Contexto de autenticación
/lib                   # Utilidades y funciones auxiliares
  api.ts               # Configuración de Axios para llamadas a la API
/middleware.ts         # Middleware para protección de rutas
/public                # Archivos estáticos
```

## Tecnologías utilizadas

- [Next.js](https://nextjs.org/) - Framework de React
- [TypeScript](https://www.typescriptlang.org/) - Superset tipado de JavaScript
- [Tailwind CSS](https://tailwindcss.com/) - Framework CSS utilitario
- [Zustand](https://github.com/pmndrs/zustand) - Biblioteca de gestión de estado
- [React Hook Form](https://react-hook-form.com/) - Manejo de formularios
- [Zod](https://github.com/colinhacks/zod) - Validación de esquemas
- [Axios](https://axios-http.com/) - Cliente HTTP

## Licencia

Este proyecto está licenciado bajo la Licencia MIT.
