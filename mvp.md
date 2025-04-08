# Documento MVP para una Aplicación Administrativa en Next.js

A continuación, se presenta un documento detallado para el desarrollo de un **Producto Mínimo Viable (MVP)** de una aplicación administrativa en **Next.js**, diseñada para conectarse al backend proporcionado en la documentación de la API. Este MVP se enfocará en las funcionalidades esenciales para que los administradores puedan gestionar usuarios, carreras, platos, comentarios, calificaciones y menús de manera eficiente, asegurando seguridad y usabilidad.

---

## **Objetivo**
Desarrollar un panel administrativo en Next.js que permita a usuarios con roles **ADMIN** y **EMPLOYEE** interactuar con el backend mediante los endpoints de la API, proporcionando las herramientas básicas para la gestión de un sistema que incluye autenticación, carreras, platos, comentarios, calificaciones y menús.

---

## **Alcance del MVP**
El MVP incluirá las siguientes funcionalidades mínimas:
1. **Autenticación**: Registro, inicio de sesión, cierre de sesión y cambio de contraseña.
2. **Gestión de Usuarios**: Visualización y edición de perfiles.
3. **Gestión de Carreras**: Operaciones CRUD (Crear, Leer, Actualizar, Eliminar).
4. **Gestión de Platos**: Creación y listado con paginación.
5. **Visualización de Comentarios y Calificaciones**: Listado de comentarios y calificaciones por plato con paginación.
6. **Gestión de Menús**: Creación y listado con paginación.
7. **Seguridad**: Protección de rutas y verificación de roles.
8. **Interfaz de usuario**: Diseño responsive y consistente.

---

## **Estructura de la Aplicación**

### **1. Páginas**
La aplicación utilizará el sistema de enrutamiento basado en archivos de Next.js. Las páginas principales serán:
- **/login**: Formulario de inicio de sesión.
- **/register**: Formulario de registro (accesible solo para administradores).
- **/dashboard**: Página principal con un resumen y enlaces a otras secciones.
- **/users**: Listado de usuarios y acceso a edición de perfiles.
- **/carriers**: Gestión completa de carreras (CRUD).
- **/dishes**: Listado y creación de platos.
- **/menus**: Listado y creación de menús.
- **/comments/:dishId**: Visualización de comentarios de un plato específico.
- **/ratings/:dishId**: Visualización de calificaciones de un plato específico.

### **2. Componentes**
Se desarrollarán componentes reutilizables para mantener el código modular y eficiente:
- **Navbar**: Barra de navegación con enlaces y opción de cierre de sesión.
- **Forms**: Componentes para formularios de creación y edición (usuarios, carreras, platos, menús).
- **Tables**: Tablas con paginación para listar datos (usuarios, carreras, platos, menús, comentarios, calificaciones).
- **ImageUploader**: Componente para cargar imágenes en formularios (usuarios y platos).
- **Modals**: Diálogos para confirmaciones (ejemplo: eliminar una carrera).

### **3. Gestión de Estado**
- Se utilizará **Context API** para manejar el estado global, incluyendo:
  - Token de autenticación (`auth_token`).
  - Información del usuario (rol, ID, etc.).
- Alternativamente, Redux podría considerarse para expansiones futuras si la complejidad aumenta.

### **4. Enrutamiento**
- Rutas protegidas mediante middleware de autenticación en Next.js.
- Redirección automática a `/login` si no hay token o el rol no es válido (ADMIN o EMPLOYEE).

### **5. Integración con la API**
- Uso de **Axios** para solicitudes HTTP.
- Manejo del token JWT almacenado en la cookie `auth_token` para endpoints protegidos.
- Implementación de interceptores en Axios para manejar errores y gestionar la expiración del token.

### **6. Seguridad**
- Middleware para verificar autenticación y roles en rutas protegidas.
- Validación de datos en el frontend antes de enviar solicitudes.
- Protección contra CSRF (siguiendo las recomendaciones del backend).

### **7. UI/UX**
- Uso de **Tailwind CSS** para un diseño responsive y consistente.
- Tema claro por defecto (oscuro opcional en futuras iteraciones).
- Prioridad en accesibilidad y usabilidad.

---

## **Funcionalidades Detalladas**

### **1. Autenticación**
- **Registro (POST /authentication/register)**:
  - Formulario con campos: `email`, `identification`, `name`, `password`, `securityWord`, `role`, `position` (opcional), `photo` (opcional), `isActive` (opcional), `careerIds`.
  - Acceso restringido a usuarios con rol ADMIN.
- **Inicio de Sesión (POST /authentication/login)**:
  - Formulario con `email` y `password`.
  - Almacenar el token JWT en el estado global.
- **Cierre de Sesión (POST /authentication/logout)**:
  - Eliminar el token y redirigir a `/login`.
- **Cambio de Contraseña (POST /authentication/changePassword)**:
  - Formulario con `email`, `securityWord`, `newPassword`.
- **Perfil de Usuario (GET /authentication/perfil/:id, PATCH /authentication/edit/:id)**:
  - Visualización y edición de datos del usuario, incluyendo carga de imagen.

### **2. Gestión de Carreras**
- **Listado (GET /carriers)**:
  - Tabla con todas las carreras, filtrable por estado (`isActive`).
- **Creación (POST /carriers)**:
  - Formulario con `name`, `description` (opcional), `isActive` (opcional).
- **Detalles y Edición (GET /carriers/:id, PATCH /carriers/:id)**:
  - Visualización y actualización de una carrera específica.
- **Eliminación (DELETE /carriers/:id)**:
  - Botón con modal de confirmación.

### **3. Gestión de Platos**
- **Listado (POST /dish/all)**:
  - Tabla con paginación (`offset` y `limit`) mostrando todos los platos.
- **Creación (POST /dish)**:
  - Formulario con `title`, `description`, `photo` (opcional), `cost`, `calories`, `proteins`, `fats`, `carbohydrates`, `isActive` (opcional).
  - Carga de imagen mediante `FormData`.

### **4. Visualización de Comentarios y Calificaciones**
- **Comentarios por Plato (POST /comment/dish/:id)**:
  - Página con tabla paginada mostrando comentarios de un plato específico.
- **Calificaciones por Plato (POST /dish-ratting/:id)**:
  - Página con tabla paginada mostrando calificaciones de un plato específico.

### **5. Gestión de Menús**
- **Listado (POST /menu/all)**:
  - Tabla con paginación mostrando todos los menús.
- **Creación (POST /menu)**:
  - Formulario con `title`, `description`, `date`, `isActive` (opcional).

---

## **Consideraciones Técnicas**

### **Manejo de Imágenes**
- Uso de `FormData` para enviar imágenes en solicitudes `POST` y `PATCH` (registro de usuarios y creación de platos).
- Previsualización de imágenes en el formulario antes de enviar.

### **Paginación**
- Implementación de controles en las tablas para manejar `offset` y `limit`.
- Mostrar número total de registros y navegación entre páginas.

### **Manejo de Errores**
- Mostrar mensajes de error al usuario (ejemplo: "Credenciales inválidas" en el login).
- Registrar errores en consola para depuración.

### **Performance**
- Optimizar solicitudes HTTP evitando duplicados.
- Usar caching en el lado del cliente cuando sea posible (ejemplo: lista de carreras).

---

## **Estructura de Carpetas (Sugerida)**


/project-root
├── /app
│   ├── /login
│   │   └── page.tsx
│   ├── /register
│   │   └── page.tsx
│   ├── /dashboard
│   │   └── page.tsx
│   ├── /users
│   │   └── page.tsx
│   ├── /carriers
│   │   └── page.tsx
│   ├── /dishes
│   │   └── page.tsx
│   ├── /menus
│   │   └── page.tsx
│   ├── /comments/[dishId]
│   │   └── page.tsx
│   ├── /ratings/[dishId]
│   │   └── page.tsx
│   └── layout.tsx
├── /components
│   ├── Navbar.tsx
│   ├── Forms.tsx
│   ├── Tables.tsx
│   ├── ImageUploader.tsx
│   └── Modals.tsx
├── /context
│   └── AuthContext.tsx
├── /lib
│   └── api.ts (Configuración de Axios)
├── /middleware.ts (Protección de rutas)
└── /public
├── /images
└── /styles

---

## **Próximos Pasos**
1. Diseñar wireframes básicos para las páginas principales.
2. Configurar el proyecto Next.js con Tailwind CSS y Axios.
3. Implementar la lógica de autenticación (login, registro, logout).
4. Desarrollar el middleware de protección de rutas y verificación de roles.
5. Crear componentes reutilizables (Navbar, Forms, Tables).
6. Integrar los endpoints de la API, comenzando por autenticación y gestión de carreras.

---

Este MVP establece una base sólida para una aplicación administrativa funcional, conectada al backend proporcionado, con posibilidad de expansión en iteraciones futuras (por ejemplo, edición/eliminación de platos o gestión de asistencias).